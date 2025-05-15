import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  FormErrorMessage,
  Select,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';

// Custom hook for fetching categories
const useFetchCategories = (baseUrl, token, navigate) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(
          `${baseUrl}api/categories/getAllCategories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid API response: No categories found');
        }
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load categories';
        if (errorMessage.includes('Session expired')) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [baseUrl, token, navigate]);

  return { categories, loading, error };
};

// Validation regex patterns
const NAME_REGEX = /^[A-Za-z0-9\s&'-]{2,100}$/;
const ADDRESS_REGEX = /^[A-Za-z0-9\s,.-]{5,200}$/;
const DETAILS_REGEX = /^[\w\s.,!?-]{10,500}$/;
const CATEGORY_ID_REGEX = /^[a-fA-F0-9]{24}$/; // Assuming MongoDB ObjectId

export default function CreateRestaurant() {
  const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL || '', []);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  // Fetch categories
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetchCategories(baseUrl, token, navigate);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: 'onBlur', // Validate on blur for better UX
  });

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch opening_time for custom validation
  const openingTime = watch('opening_time');

  // Validate form prerequisites
  if (!baseUrl || !token) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          Configuration error: Missing API URL or authentication token.
        </Alert>
      </Box>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('category_id', data.category_id);
      formData.append('address', data.address.trim());
      formData.append('details', data.details.trim());
      formData.append('opening_time', data.opening_time);
      formData.append('closing_time', data.closing_time);
      formData.append('rating', data.rating);
      formData.append('locationAddress', data.locationAddress.trim());
      formData.append('latitude', data.latitude);
      formData.append('longitude', data.longitude);
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      const response = await axios.post(
        `${baseUrl}api/resturant/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.status !== 201) {
        throw new Error('Failed to create restaurant');
      }

      setSubmitSuccess('Restaurant created successfully!');
      reset();
      setTimeout(() => {
        navigate('/admin/restaurants');
      }, 1500);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create restaurant';
      if (errorMessage.includes('Session expired')) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom validation for closing time
  const validateClosingTime = (value) => {
    if (!openingTime || !value) return true; // Skip if either is empty
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(openingTime) || !timeRegex.test(value)) {
      return 'Invalid time format';
    }
    const [openHours, openMinutes] = openingTime.split(':').map(Number);
    const [closeHours, closeMinutes] = value.split(':').map(Number);
    const openTotalMinutes = openHours * 60 + openMinutes;
    let closeTotalMinutes = closeHours * 60 + closeMinutes;
    if (closeTotalMinutes <= openTotalMinutes) {
      closeTotalMinutes += 24 * 60; // Assume next day for cross-midnight
    }
    if (closeTotalMinutes <= openTotalMinutes) {
      return 'Closing time must be after opening time';
    }
    if (closeTotalMinutes === openTotalMinutes) {
      return 'Closing time cannot be the same as opening time';
    }
    return true;
  };

  // Custom validation for category_id
  const validateCategoryId = (value) => {
    if (categories.length > 0) {
      return (
        categories.some((cat) => cat._id === value) ||
        'Invalid category selected'
      );
    }
    return CATEGORY_ID_REGEX.test(value) || 'Invalid category ID format';
  };

  // Custom validation for image
  const validateImage = (files) => {
    if (!files || files.length === 0) return true; // Image is optional
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      return 'Image must be JPEG, PNG, or GIF';
    }
    if (file.size > maxSize) {
      return 'Image size must not exceed 5MB';
    }
    return true;
  };

  if (categoriesLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box maxW="600px" mx="auto" my="55px" p={6}>
      <Heading as="h1" size="xl" textAlign="center" color={textColor} mb={8}>
        Create Restaurant
      </Heading>
      {categoriesError && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {categoriesError}. You can still enter a category ID manually.
        </Alert>
      )}
      {submitError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {submitError}
        </Alert>
      )}
      {submitSuccess && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {submitSuccess}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <VStack spacing={4}>
          <FormControl isInvalid={errors.name}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              {...register('name', {
                required: 'Restaurant name is required',
                pattern: {
                  value: NAME_REGEX,
                  message:
                    "Name must be 2-100 characters, letters, numbers, spaces, &, ', or - only",
                },
                validate: (value) =>
                  value.trim().length > 0 || 'Name cannot be only spaces',
              })}
            />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.category_id}>
            <FormLabel>Category</FormLabel>
            {categories.length > 0 ? (
              <Select
                placeholder="Select a category"
                {...register('category_id', {
                  required: 'Category is required',
                  validate: validateCategoryId,
                })}
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type="text"
                placeholder="Enter category ID"
                {...register('category_id', {
                  required: 'Category ID is required',
                  pattern: {
                    value: CATEGORY_ID_REGEX,
                    message:
                      'Category ID must be a valid 24-character ObjectId',
                  },
                })}
              />
            )}
            <FormErrorMessage>{errors.category_id?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.address}>
            <FormLabel>Address</FormLabel>
            <Input
              type="text"
              {...register('address', {
                required: 'Address is required',
                pattern: {
                  value: ADDRESS_REGEX,
                  message:
                    'Address must be 5-200 characters, letters, numbers, spaces, commas, or periods',
                },
                validate: (value) =>
                  value.trim().length > 0 || 'Address cannot be only spaces',
              })}
            />
            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.details}>
            <FormLabel>Details</FormLabel>
            <Textarea
              {...register('details', {
                required: 'Details are required',
                pattern: {
                  value: DETAILS_REGEX,
                  message:
                    'Details must be 10-500 characters, letters, numbers, spaces, or basic punctuation',
                },
                validate: (value) =>
                  value.trim().length > 0 || 'Details cannot be only spaces',
              })}
            />
            <FormErrorMessage>{errors.details?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.opening_time}>
            <FormLabel>Opening Time</FormLabel>
            <Input
              type="time"
              {...register('opening_time', {
                required: 'Opening time is required',
              })}
            />
            <FormErrorMessage>{errors.opening_time?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.closing_time}>
            <FormLabel>Closing Time</FormLabel>
            <Input
              type="time"
              {...register('closing_time', {
                required: 'Closing time is required',
                validate: validateClosingTime,
              })}
            />
            <FormErrorMessage>{errors.closing_time?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.rating}>
            <FormLabel>Rating</FormLabel>
            <Input
              type="number"
              step="0.1"
              {...register('rating', {
                required: 'Rating is required',
                min: { value: 0, message: 'Rating must be at least 0' },
                max: { value: 5, message: 'Rating cannot exceed 5' },
                validate: (value) =>
                  !isNaN(value) || 'Rating must be a valid number',
              })}
            />
            <FormErrorMessage>{errors.rating?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.locationAddress}>
            <FormLabel>Location Address</FormLabel>
            <Input
              type="text"
              {...register('locationAddress', {
                required: 'Location address is required',
                pattern: {
                  value: ADDRESS_REGEX,
                  message:
                    'Location address must be 5-200 characters, letters, numbers, spaces, commas, or periods',
                },
                validate: (value) =>
                  value.trim().length > 0 ||
                  'Location address cannot be only spaces',
              })}
            />
            <FormErrorMessage>
              {errors.locationAddress?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.latitude}>
            <FormLabel>Latitude</FormLabel>
            <Input
              type="number"
              step="any"
              {...register('latitude', {
                required: 'Latitude is required',
                min: {
                  value: -90,
                  message: 'Latitude must be between -90 and 90',
                },
                max: {
                  value: 90,
                  message: 'Latitude must be between -90 and 90',
                },
                validate: (value) =>
                  !isNaN(value) || 'Latitude must be a valid number',
              })}
            />
            <FormErrorMessage>{errors.latitude?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.longitude}>
            <FormLabel>Longitude</FormLabel>
            <Input
              type="number"
              step="any"
              {...register('longitude', {
                required: 'Longitude is required',
                min: {
                  value: -180,
                  message: 'Longitude must be between -180 and 180',
                },
                max: {
                  value: 180,
                  message: 'Longitude must be between -180 and 180',
                },
                validate: (value) =>
                  !isNaN(value) || 'Longitude must be a valid number',
              })}
            />
            <FormErrorMessage>{errors.longitude?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.image}>
            <FormLabel>Image (Optional)</FormLabel>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              {...register('image', {
                validate: validateImage,
              })}
            />
            <FormErrorMessage>{errors.image?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Create Restaurant
          </Button>
          <Button
            bg="black"
            color="white"
            _hover={{ bg: 'gray.800' }}
            size="lg"
            width="full"
            onClick={() => navigate('/admin/restaurants')}
          >
            Back
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
