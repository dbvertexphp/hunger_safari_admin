/* eslint-disable */

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  FormErrorMessage,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';

// Custom hook for fetching restaurants
const useFetchRestaurants = (baseUrl, token, navigate) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(`${baseUrl}api/resturant/allAdmin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('res', response.data);
        if (!response.data) {
          throw new Error('Invalid API response: No restaurants found');
        }
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load restaurants';
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
    fetchRestaurants();
  }, [baseUrl, token, navigate]);

  return { restaurants, loading, error };
};

export default function CreateSubAdmin() {
  const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL, []);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
  } = useFetchRestaurants(baseUrl, token, navigate);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      if (!baseUrl || !token) {
        throw new Error('Missing API URL or authentication token');
      }
      const response = await axios.post(
        `${baseUrl}api/user/createSubAdmin`,
        {
          full_name: data.full_name,
          email: data.email,
          mobile: data.mobile,
          password: data.password,
          restaurant_id: data.restaurant_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSubmitSuccess('Sub-admin created successfully!');
      reset(); // Clear form
      setTimeout(() => {
        navigate('/admin/subadmins'); // Redirect to sub-admins table
      }, 1500);
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create sub-admin';
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

  if (restaurantsLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (restaurantsError) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {restaurantsError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="600px" mx="auto" my="70px" p={6}>
      <Heading as="h1" size="xl" textAlign="center" color={textColor} mb={8}>
        Create Sub-Admin
      </Heading>
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4}>
          <FormControl isInvalid={errors.full_name}>
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              {...register('full_name', {
                required: 'Full name is required',
                pattern: {
                  value: /^(?=.*[A-Za-z])[A-Za-z\s]+$/,
                  message: 'Full name must contain only letters and spaces',
                },
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters',
                },
              })}
            />
            <FormErrorMessage>
              {errors.full_name && errors.full_name.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Invalid email address',
                },
              })}
            />
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.mobile}>
            <FormLabel>Mobile</FormLabel>
            <Input
              type="text"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Mobile number must be 10 digits',
                },
              })}
            />
            <FormErrorMessage>
              {errors.mobile && errors.mobile.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            <FormErrorMessage>
              {errors.password && errors.password.message}
            </FormErrorMessage>
          </FormControl>

          {restaurants.length > 0 ? (
            <FormControl isInvalid={errors.restaurant_id}>
              <FormLabel>Restaurant</FormLabel>
              <Select
                placeholder="Select a restaurant"
                {...register('restaurant_id', {
                  required: 'Restaurant is required',
                })}
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors.restaurant_id && errors.restaurant_id.message}
              </FormErrorMessage>
            </FormControl>
          ) : (
            <FormControl isInvalid={errors.restaurant_id}>
              <FormLabel>Restaurant ID</FormLabel>
              <Input
                type="text"
                {...register('restaurant_id', {
                  required: 'Restaurant ID is required',
                })}
              />
              <FormErrorMessage>
                {errors.restaurant_id && errors.restaurant_id.message}
              </FormErrorMessage>
            </FormControl>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Create Sub-Admin
          </Button>
					  <Button
						style={{ backgroundColor: "black", color:"white"}}
            size="lg"
            width="full"
						onClick={() => navigate('/admin/subadmins')}
          >
            Back
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
