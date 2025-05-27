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
  Switch,
} from '@chakra-ui/react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
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
import { useNavigate } from 'react-router-dom';
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
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

// Custom hook for fetching sub-admins
const useFetchSubAdmins = (baseUrl, token, navigate, restaurants) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(`${baseUrl}api/user/getAllSubAdmins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data?.subAdmins) {
          throw new Error('Invalid API response: No sub-admins found');
        }
        console.log('API Response:', response.data.subAdmins);
        setData(
          response.data.subAdmins.map((user) => {
            return {
              id: user._id || '',
              full_name: user.full_name || 'N/A',
              email: user.email || 'N/A',
              mobile: user.mobile || 'N/A',
              restaurant_id: user.restaurant_id?._id || 'N/A',
              restaurant_name: user.restaurant_id?.name || 'N/A',
              plain_password: user.plain_password || 'N/A',
              active: user.active ?? true,
              codOrders: user.codOrders || 0,
              onlineOrders: user.onlineOrders || 0,
              codCollection: user.codCollection || 0,
              onlineCollection: user.onlineCollection || 0,
            };
          }),
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to load data';
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
    if (restaurants.length > 0) {
      fetchData();
    }
  }, [baseUrl, token, navigate, restaurants]);

  return { data, loading, error, setData };
};

// Custom hook for fetching restaurants
const useFetchRestaurants = (baseUrl, token) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!baseUrl || !token) {
          throw new Error('Missing API URL or authentication token');
        }
        const response = await axios.get(`${baseUrl}api/resturant/allAdmin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data) {
          throw new Error('Invalid API response: No restaurants found');
        }
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        if (
          error.response?.data?.message === 'Not authorized, token failed' ||
          error.response?.data?.message === 'Session expired or logged in on another device' ||
          error.response?.data?.message ===
            'Un-Authorized, You are not authorized to access this route.' || 'Not authorized, token failed'
        ) {
          localStorage.removeItem('token');
          navigate('/');
        }
        setError(error.response?.data?.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [baseUrl, token, navigate]);

  return { restaurants, loading, error };
};

// Define columns
const getColumns = (textColor, handleEditClick, handleToggleActive) => [
  columnHelper.accessor('full_name', {
    id: 'full_name',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        FULL NAME
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('email', {
    id: 'email',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        EMAIL
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('mobile', {
    id: 'mobile',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        MOBILE
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('restaurant_name', {
    id: 'restaurant_name',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        RESTAURANT
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('plain_password', {
    id: 'plain_password',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        PASSWORD
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('codOrders', {
    id: 'codOrders',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        CODORDERS
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('onlineOrders', {
    id: 'onlineOrders',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        ONLINEORDERS
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('codCollection', {
    id: 'codCollection',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        CODCOLLECTION
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('onlineCollection', {
    id: 'onlineCollection',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        ONLINECOLLECTION
      </Text>
    ),
    cell: (info) => (
      <Text color={textColor} fontSize="sm" fontWeight="700">
        {info.getValue()}
      </Text>
    ),
  }),
  columnHelper.accessor('active', {
    id: 'active',
    header: () => (
      <Text
        justifyContent="space-between"
        align="center"
        fontSize={{ sm: '10px', lg: '12px' }}
        color="gray.400"
      >
        ACTIVE
      </Text>
    ),
    cell: (info) => (
      <Switch
        isChecked={info.getValue()}
        onChange={() => handleToggleActive(info.row.original)}
      />
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
];

function Settings() {
  const renderCount = useRef(0);
  renderCount.current += 1;
  useEffect(() => {
    console.log(`Settings component rendered ${renderCount.current} times`);
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
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
  } = useFetchRestaurants(baseUrl, token);
  const { data, loading, error, setData } = useFetchSubAdmins(
    baseUrl,
    token,
    navigate,
    restaurants,
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    restaurant_id: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleActive = useCallback(
    async (user) => {
      try {
        const userId = user.id;
        const newActiveStatus = !user.active;
        const response = await axios.patch(
          `${baseUrl}api/admin/updateUserStatus`,
          { userId, active: newActiveStatus },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.data.success) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === user.id ? { ...item, active: newActiveStatus } : item,
            ),
          );
        } else {
          throw new Error(
            response.data.message || 'Failed to update active status',
          );
        }
      } catch (error) {
        console.error('Error toggling active status:', error);
        setFormError(error.message || 'Failed to update active status');
      }
    },
    [baseUrl, token, setData, setFormError],
  );

  const handleEditClick = useMemo(
    () =>
      debounce((user) => {
        try {
          console.log('Edit clicked, user:', user);
          if (!user || !user.id) {
            console.error('Invalid user data:', user);
            setFormError('Cannot edit: Invalid user data');
            return;
          }
          setSelectedUser(user);
          setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            mobile: user.mobile || '',
            restaurant_id: user.restaurant_id || '',
          });
          setIsEditModalOpen(true);
        } catch (error) {
          console.error('Error in handleEditClick:', error);
          setFormError('Failed to open edit modal');
        }
      }, 300),
    [setFormError, setIsEditModalOpen, setSelectedUser],
  );

  const columns = useMemo(
    () => getColumns(textColor, handleEditClick, handleToggleActive),
    [textColor, handleEditClick, handleToggleActive],
  );

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleCreateSubAdmin = () => {
    navigate('/admin/create-subadmin');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    console.log('Submitting update for user:', selectedUser?.id);
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.mobile ||
      !formData.restaurant_id
    ) {
      setFormError('All fields are required.');
      return;
    }
    const fullNameRegex = /^[a-zA-Z\s]+$/;
    if (!fullNameRegex.test(formData.full_name)) {
      setFormError('Full name can only contain letters and spaces.');
      return;
    }
    if (formData.full_name.trim().length === 0) {
      setFormError('Full name cannot be only spaces.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.restaurant_id) {
      setFormError('Please select a restaurant.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${baseUrl}api/user/updateSubAdmin/${selectedUser.id}`,
        {
          full_name: formData.full_name,
          email: formData.email,
          mobile: formData.mobile,
          restaurant_id: formData.restaurant_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success === true) {
        const restaurant = restaurants.find(
          (r) => r._id === formData.restaurant_id,
        );
        setData((prevData) =>
          prevData.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  full_name: formData.full_name,
                  email: formData.email,
                  mobile: formData.mobile,
                  restaurant_id: formData.restaurant_id,
                  restaurant_name: restaurant?.name || 'N/A',
                }
              : user,
          ),
        );
        setIsEditModalOpen(false);
        window.location.href = '/admin/subadmins';
        console.log('Update successful, modal closed');
      } else {
        setFormError(response.data.message || 'Failed to update user.');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update user.';
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setFormData({
      full_name: '',
      email: '',
      mobile: '',
      restaurant_id: '',
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

  if (loading || restaurantsLoading) {
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

  if (error || restaurantsError) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error || restaurantsError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {formError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {formError}
        </Alert>
      )}
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX="auto"
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Sub-Admins Table
          </Text>
          <Button colorScheme="blue" size="md" onClick={handleCreateSubAdmin}>
            Create Sub-Admin
          </Button>
        </Flex>
        <Box overflowX="auto">
          <Table
            variant="simple"
            color="gray.500"
            mb="24px"
            mt="12px"
            minWidth="1200px"
          >
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
                          header.getContext(),
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
                        cell.getContext(),
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
            {totalItems} sub-admins
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

      <Modal isOpen={isEditModalOpen} onClose={onModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Sub-Admin</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {formError}
              </Alert>
            )}
            <FormControl mb={4} isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Mobile</FormLabel>
              <Input
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Restaurant</FormLabel>
              <Select
                name="restaurant_id"
                value={formData.restaurant_id}
                onChange={handleInputChange}
                placeholder="Select restaurant"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleUpdateUser}
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
    </Box>
  );
}

export default function SettingsWrapper() {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Settings />
    </ErrorBoundary>
  );
}
