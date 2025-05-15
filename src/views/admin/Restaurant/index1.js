import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Image,
} from '@chakra-ui/react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { debounce } from 'lodash';

const columnHelper = createColumnHelper();

// Error boundary fallback
const FallbackComponent = ({ error }) => (
  <Box p={4}>
    <Alert status="error">
      <AlertIcon />
      Something went wrong: {error.message}
    </Alert>
  </Box>
);

// Custom hook for fetching restaurants
const useFetchRestaurants = (baseUrl, token) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(`${baseUrl}api/resturant/getAllRestaurantsWithDetails`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data) {
          throw new Error('Invalid API response: No restaurants found');
        }
        setData(
          response.data.map((restaurant) => ({
            id: restaurant._id || '',
            name: restaurant.name || 'N/A',
            category: restaurant.category_id?.name || 'N/A',
            address: restaurant.address || 'N/A',
						time: `${restaurant.opening_time} - ${restaurant.closing_time}` || 'N/A',
            rating: restaurant.rating || 0,
            subAdminName: restaurant.subAdminName || 'N/A',
						tax_rate:restaurant.tax_rate || 0,
            subcategoryCount: restaurant.subcategories?.length || 0,
            subcategories: restaurant.subcategories?.map((sub) => ({
              _id: sub._id,
              name: sub.name,
              image: sub.image,
              menuItems: sub.menuItems?.map((item) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                description: item.description,
                image: item.image,
              })) || [],
            })) || [],
          }))
        );
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load restaurants';
        if (errorMessage.includes('Session expired')) {
          localStorage.removeItem('token');
          Navigate('/');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUrl, token]);

  return { data, loading, error, setData };
};

// Custom hook for fetching categories
const useFetchCategories = (baseUrl, token) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(`${baseUrl}api/categories/getAllCategories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data) {
          throw new Error('Invalid API response: No categories found');
        }
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUrl, token]);

  return { categories, loading, error };
};

// Define columns
const getColumns = (textColor, handleEditClick, handleViewDetailsClick) => [
  columnHelper.accessor('name', {
    id: 'name',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        RESTAURANT NAME
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('category', {
    id: 'category',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        CATEGORY
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('address', {
    id: 'address',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        ADDRESS
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
	columnHelper.accessor('time', {
    id: 'time',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        TIME
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('subAdminName', {
    id: 'subAdminName',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        SUB-ADMIN
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
	columnHelper.accessor('rating', {
    id: 'rating',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        RATING
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
	columnHelper.accessor('tax_rate', {
    id: 'tax_rate',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        TAX
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('subcategoryCount', {
    id: 'subcategoryCount',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        SUBCATEGORIES
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        ACTIONS
      </Text>
    ),
    cell: ({ row }) => (
      <Button
        size="sm"
        colorScheme="blue"
        leftIcon={<EditIcon />}
        onClick={() => handleEditClick(row.original)}
      >
        Edit
      </Button>
    ),
  }),
  columnHelper.display({
    id: 'viewDetails',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        DETAILS
      </Text>
    ),
    cell: ({ row }) => (
      <Button
        size="sm"
        colorScheme="teal"
        leftIcon={<ViewIcon />}
        onClick={() => handleViewDetailsClick(row.original)}
      >
        View Details
      </Button>
    ),
  }),
];

function Restaurants() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  useEffect(() => {
    console.log(`Restaurants component rendered ${renderCount.current} times`);
  }, []);

  const [sorting, setSorting] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL, []);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const {
    data,
    loading,
    error,
    setData
  } = useFetchRestaurants(baseUrl, token);
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useFetchCategories(baseUrl, token);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedRestaurantDetails, setSelectedRestaurantDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category_id: '',
    tax_rate: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = useMemo(
    () =>
      debounce((restaurant) => {
        try {
          if (!restaurant || !restaurant.id) {
            console.error('Invalid restaurant data:', restaurant);
            setFormError('Cannot edit: Invalid restaurant data');
            return;
          }
          setSelectedRestaurant(restaurant);
          setFormData({
            name: restaurant.name || '',
            address: restaurant.address || '',
            category_id: restaurant.category_id || '',
            tax_rate: restaurant.tax_rate || '',
          });
          setIsEditModalOpen(true);
        } catch (error) {
          console.error('Error in handleEditClick:', error);
          setFormError('Failed to open edit modal');
        }
      }, 300),
    []
  );

  const handleViewDetailsClick = useMemo(
    () =>
      debounce((restaurant) => {
        try {
          if (!restaurant || !restaurant.id) {
            console.error('Invalid restaurant data:', restaurant);
            setFormError('Cannot view details: Invalid restaurant data');
            return;
          }
          setSelectedRestaurantDetails(restaurant);
          setIsDetailsModalOpen(true);
        } catch (error) {
          console.error('Error in handleViewDetailsClick:', error);
          setFormError('Failed to open details modal');
        }
      }, 300),
    []
  );

  const columns = useMemo(
    () => getColumns(textColor, handleEditClick, handleViewDetailsClick),
    [textColor, handleEditClick, handleViewDetailsClick]
  );

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleCreateRestaurant = () => {
    navigate('/create-restaurant');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateRestaurant = async () => {
    if (
      !formData.name ||
      !formData.address ||
      !formData.category_id ||
      !formData.tax_rate
    ) {
      setFormError('All fields are required.');
      return;
    }
    if (formData.name.trim().length === 0) {
      setFormError('Restaurant name cannot be only spaces.');
      return;
    }
    if (formData.address.trim().length === 0) {
      setFormError('Address cannot be only spaces.');
      return;
    }
    const taxRateRegex = /^\d+(\.\d{1,2})?$/;
    if (!taxRateRegex.test(formData.tax_rate)) {
      setFormError('Please enter a valid tax rate (e.g., 10 or 10.5).');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${baseUrl}api/resturant/update/${selectedRestaurant.id}`,
        {
          name: formData.name,
          address: formData.address,
          category_id: formData.category_id,
          tax_rate: parseFloat(formData.tax_rate),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success === true) {
        const category = categories.find(
          (c) => c._id === formData.category_id
        );
        setData((prevData) =>
          prevData.map((restaurant) =>
            restaurant.id === selectedRestaurant.id
              ? {
                  ...restaurant,
                  name: formData.name,
                  address: formData.address,
                  category_id: formData.category_id,
                  category: category?.name || 'N/A',
                  tax_rate: parseFloat(formData.tax_rate),
                }
              : restaurant
          )
        );
        setIsEditModalOpen(false);
        window.location.href = '/admin/restaurants';
      } else {
        setFormError(response.data.message || 'Failed to update restaurant.');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update restaurant.';
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedRestaurant(null);
    setFormData({
      name: '',
      address: '',
      category_id: '',
      tax_rate: '',
    });
    setFormError('');
  };

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading || categoriesLoading) {
    return (
      <Box
        pt={{ base: '130px', md: '80px', xl: '80px' }}
        textAlign="center"
        py={10}
      >
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error || categoriesError) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error || categoriesError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Restaurants Table
          </Text>
          <Button colorScheme="blue" size="md" onClick={handleCreateRestaurant}>
            Create Restaurant
          </Button>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor={
                        header.column.getCanSort() ? 'pointer' : 'default'
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      aria-sort={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <Flex
                        justifyContent="space-between"
                        align="center"
                        fontSize={{ sm: '10px', lg: '12px' }}
                        color="gray.400"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <ArrowUpIcon ml={1} />
                          ) : (
                            <ArrowDownIcon ml={1} />
                          )
                        ) : null}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      fontSize={{ sm: '14px' }}
                      minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                      borderColor="transparent"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          px="25px"
          py="10px"
        >
          <Text fontSize="sm" color={textColor}>
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
            {totalItems} restaurants
          </Text>
          <HStack>
            <Button
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              isDisabled={currentPage === 1}
              leftIcon={<ChevronLeftIcon />}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                onClick={() => goToPage(page)}
                variant={currentPage === page ? 'solid' : 'outline'}
              >
                {page}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              rightIcon={<ChevronRightIcon />}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Card>

      {/* Edit Restaurant Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Restaurant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {formError}
              </Alert>
            )}
            <FormControl mb={4} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter restaurant name"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                placeholder="Select category"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Tax Rate (%)</FormLabel>
              <Input
                name="tax_rate"
                type="number"
                value={formData.tax_rate}
                onChange={handleInputChange}
                placeholder="Enter tax rate"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleUpdateRestaurant}
              isLoading={isSubmitting}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={onModalClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Restaurant Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRestaurantDetails ? (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  {selectedRestaurantDetails.name}
                </Text>
                {selectedRestaurantDetails.subcategories?.length > 0 ? (
                  selectedRestaurantDetails.subcategories.map((subcategory) => (
                    <Box key={subcategory._id} mb={6}>
                      <Flex alignItems="center" mb={2}>
                        <Text fontSize="md" fontWeight="bold">
                          {subcategory.name}
                        </Text>
                      </Flex>
                      {subcategory.image && (
                        <Box mb={2}>
                          <Image
                            src={subcategory.image}
                            alt={subcategory.name}
                            maxW={{ base: '100px', md: '150px' }}
                            borderRadius="8px"
                            objectFit="cover"
                            fallbackSrc="https://via.placeholder.com/150?text=No+Image"
                          />
                        </Box>
                      )}
                      <Text fontSize="sm" fontWeight="bold" mb={2}>
                        Menu Items:
                      </Text>
                      {subcategory.menuItems?.length > 0 ? (
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Name</Th>
                              <Th>Price</Th>
                              <Th>Description</Th>
                              <Th>Image</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {subcategory.menuItems.map((item) => (
                              <Tr key={item._id}>
                                <Td>{item.name}</Td>
                                <Td>${item.price}</Td>
                                <Td>{item.description}</Td>
                                <Td>
                                  {item.image && (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      maxW="50px"
                                      borderRadius="4px"
                                      objectFit="cover"
                                      fallbackSrc="https://via.placeholder.com/50?text=No+Image"
                                    />
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      ) : (
                        <Text fontSize="sm">No menu items available.</Text>
                      )}
                    </Box>
                  ))
                ) : (
                  <Text>No subcategories available.</Text>
                )}
              </Box>
            ) : (
              <Spinner />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default function RestaurantsWrapper() {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Restaurants />
    </ErrorBoundary>
  );
}
