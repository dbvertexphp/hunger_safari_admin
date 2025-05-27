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
	Textarea,
	Switch,
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
import { ToastContainer, toast } from 'react-toastify'; // Added react-toastify imports
import 'react-toastify/dist/ReactToastify.css'; // Added toastify CSS

const columnHelper = createColumnHelper();

const FallbackComponent = ({ error }) => (
	<Box p={4}>
		<Alert status="error">
			<AlertIcon />
			Something went wrong: {error.message}
		</Alert>
	</Box>
);

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
						category_id: restaurant.category_id?._id || '',
						address: restaurant.address || 'N/A',
						details: restaurant.details || 'N/A',
						opening_time: restaurant.opening_time || 'N/A',
						closing_time: restaurant.closing_time || 'N/A',
						tax_rate: restaurant.tax_rate || 0,
						rating: restaurant.rating || 0,
						createdAt: restaurant.createdAt || 'N/A',
						locationAddress: restaurant.locationAddress || 'N/A',
						latitude: restaurant.latitude || 0,
						longitude: restaurant.longitude || 0,
						image: restaurant.image || '',
						subAdminName: restaurant.subAdminName || 'N/A',
						isActive: restaurant.active ?? true, // Added isActive field
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
				if (errorMessage.includes('Session expired') || errorMessage.includes('Un-Authorized')) {
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

const getColumns = (textColor, handleEditClick, handleViewDetailsClick, handleToggleActive, baseUrl, token, setData) => [
	columnHelper.accessor('image', {
		id: 'image',
		header: () => (
			<Text
				justifyContent="space-between"
				align="center"
				fontSize={{ sm: '10px', lg: '12px' }}
				color="gray.400"
			>
				IMAGE
			</Text>
		),
		cell: (info) => (
			<Image
				src={info.getValue()}
				alt="Restaurant"
				maxW="50px"
				borderRadius="8px"
				objectFit="cover"
				fallbackSrc="https://via.placeholder.com/50?text=No+Image"
			/>
		),
	}),
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
			<Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="wrap">
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
			<Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="wrap">
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
			<Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="wrap">
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
			<Text color={textColor} fontSize="sm" fontWeight="700" whiteSpace="wrap">
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
	columnHelper.accessor('isActive', {
		id: 'isActive',
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
		cell: ({ row }) => (
			<Switch
				isChecked={row.original.isActive}
				onChange={() => handleToggleActive(row.original)}
				colorScheme="teal"
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
	const toastTheme = useColorModeValue('light', 'dark'); // Added for toast theme
	const baseUrl = useMemo(() => process.env.REACT_APP_BASE_URL, []);
	const token = localStorage.getItem('token');
	const navigate = useNavigate();

	const { data, loading, error, setData } = useFetchRestaurants(baseUrl, token);
	const { categories, loading: categoriesLoading, error: categoriesError } = useFetchCategories(baseUrl, token);

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [selectedRestaurant, setSelectedRestaurant] = useState(null);
	const [selectedRestaurantDetails, setSelectedRestaurantDetails] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		category_id: '',
		details: '',
		opening_time: '',
		closing_time: '',
		tax_rate: '',
		rating: '',
		locationAddress: '',
		latitude: '',
		longitude: '',
		image: null,
	});
	const [formError, setFormError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imagePreview, setImagePreview] = useState('');

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
						details: restaurant.details || '',
						opening_time: restaurant.opening_time || '',
						closing_time: restaurant.closing_time || '',
						tax_rate: restaurant.tax_rate || '',
						rating: restaurant.rating || '',
						locationAddress: restaurant.locationAddress || '',
						latitude: restaurant.latitude || '',
						longitude: restaurant.longitude || '',
						image: null,
					});
					setImagePreview(restaurant.image || '');
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

	const handleToggleActive = useMemo(
		() =>
			debounce(async (restaurant) => {
				try {
					const newStatus = !restaurant.isActive;
					const response = await axios.put(
						`${baseUrl}api/resturant/statusUpdate/${restaurant.id}`,
						{ isActive: newStatus },
						{
							headers: {
								Authorization: `Bearer ${token}`,
								'Content-Type': 'application/json',
							},
						}
					);

					if (response.data.message === 'Restaurant updated successfully') {
						setData((prevData) =>
							prevData.map((r) =>
								r.id === restaurant.id ? { ...r, isActive: newStatus } : r
							)
						);
						toast.success(`Restaurant ${newStatus ? 'activated' : 'deactivated'} successfully!`, {
							position: 'top-right',
							autoClose: 3000,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							theme: toastTheme,
						});
					} else {
						setFormError(response.data.message || 'Failed to update active status.');
						toast.error(response.data.message || 'Failed to update active status.', {
							position: 'top-right',
							autoClose: 3000,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							theme: toastTheme,
						});
					}
				} catch (error) {
					console.error('Error toggling active status:', error);
					const errorMessage = error.response?.data?.message || 'Failed to update active status.';
					setFormError(errorMessage);
					toast.error(errorMessage, {
						position: 'top-right',
						autoClose: 3000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						theme: toastTheme,
					});
				}
			}, 300),
		[baseUrl, token, setData, toastTheme] // Added toastTheme to dependencies
	);

	const columns = useMemo(
		() => getColumns(textColor, handleEditClick, handleViewDetailsClick, handleToggleActive, baseUrl, token, setData),
		[textColor, handleEditClick, handleViewDetailsClick, handleToggleActive, baseUrl, token, setData]
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
		navigate('/admin/create-restaurant');
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const validateForm = () => {
		if (!formData.name.trim()) return 'Restaurant name is required.';
		if (!formData.address.trim()) return 'Address is required.';
		if (!formData.category_id) return 'Category is required.';
		if (!formData.tax_rate) return 'Tax rate is required.';
		if (!formData.rating) return 'Rating is required.';
		if (!formData.locationAddress.trim()) return 'Location address is required.';
		if (!formData.latitude) return 'Latitude is required.';
		if (!formData.longitude) return 'Longitude is required.';
		if (!formData.opening_time) return 'Opening time is required.';
		if (!formData.closing_time) return 'Closing time is required.';

		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(formData.opening_time)) return 'Invalid opening time format (HH:MM).';
		if (!timeRegex.test(formData.closing_time)) return 'Invalid closing time format (HH:MM).';

		const taxRateRegex = /^\d+(\.\d{1,2})?$/;
		if (!taxRateRegex.test(formData.tax_rate)) return 'Invalid tax rate (e.g., 10 or 10.5).';

		const rating = parseFloat(formData.rating);
		if (isNaN(rating) || rating < 0 || rating > 5) return 'Rating must be between 0 and 5.';

		const lat = parseFloat(formData.latitude);
		if (isNaN(lat) || lat < -90 || lat > 90) return 'Latitude must be between -90 and 90.';

		const lon = parseFloat(formData.longitude);
		if (isNaN(lon) || lon < -180 || lon > 180) return 'Longitude must be between -180 and 180.';

		return '';
	};

	const handleUpdateRestaurant = async () => {
		const validationError = validateForm();
		if (validationError) {
			setFormError(validationError);
			return;
		}

		setIsSubmitting(true);
		try {
			const formDataToSend = new FormData();
			formDataToSend.append('name', formData.name);
			formDataToSend.append('address', formData.address);
			formDataToSend.append('category_id', formData.category_id);
			formDataToSend.append('details', formData.details);
			formDataToSend.append('opening_time', formData.opening_time);
			formDataToSend.append('closing_time', formData.closing_time);
			formDataToSend.append('tax_rate', parseFloat(formData.tax_rate));
			formDataToSend.append('rating', parseFloat(formData.rating));
			formDataToSend.append('locationAddress', formData.locationAddress);
			formDataToSend.append('latitude', parseFloat(formData.latitude));
			formDataToSend.append('longitude', parseFloat(formData.longitude));
			if (formData.image) {
				formDataToSend.append('image', formData.image);
			}

			const response = await axios.put(
				`${baseUrl}api/resturant/update/${selectedRestaurant.id}`,
				formDataToSend,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (response.data.message === 'Restaurant updated successfully') {
				const category = categories.find((c) => c._id === formData.category_id);
				setData((prevData) =>
					prevData.map((restaurant) =>
						restaurant.id === selectedRestaurant.id
							? {
									...restaurant,
									name: formData.name,
									address: formData.address,
									category_id: formData.category_id,
									category: category?.name || 'N/A',
									details: formData.details,
									opening_time: formData.opening_time,
									closing_time: formData.closing_time,
									time: `${formData.opening_time} - ${formData.closing_time}`,
									tax_rate: parseFloat(formData.tax_rate),
									rating: parseFloat(formData.rating),
									locationAddress: formData.locationAddress,
									latitude: parseFloat(formData.latitude),
									longitude: parseFloat(formData.longitude),
									image: formData.image ? URL.createObjectURL(formData.image) : restaurant.image,
								}
							: restaurant
					)
				);
				setIsEditModalOpen(false);
				setFormError('');
				setImagePreview('');
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
			details: '',
			opening_time: '',
			closing_time: '',
			tax_rate: '',
			rating: '',
			locationAddress: '',
			latitude: '',
			longitude: '',
			image: null,
		});
		setFormError('');
		setImagePreview('');
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
			<Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center" py={10}>
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
			<Card flexDirection="column" w="100%" px="0px">
				<Flex px="25px" mb="8px" justifyContent="space-between" align="center">
					<Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
						Restaurants Table
					</Text>
					<Button colorScheme="blue" size="md" onClick={handleCreateRestaurant}>
						Create Restaurant
					</Button>
				</Flex>
				<Box overflowX="auto">
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
											cursor={header.column.getCanSort() ? 'pointer' : 'default'}
											onClick={header.column.getToggleSortingHandler()}
											aria-sort={
												header.column.getIsSorted()
													? header.column.getIsSorted() === 'asc'
														? 'ascending'
														: 'descending'
													: 'none'
											}
											minW={{ sm: '100px', md: '150px', lg: 'auto' }}
										>
											<Flex
												justifyContent="space-between"
												align="center"
												fontSize={{ sm: '10px', lg: '12px' }}
												color="gray.400"
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
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
											minW={{ sm: '100px', md: '150px', lg: 'auto' }}
											borderColor="transparent"
											py={2}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</Td>
									))}
								</Tr>
							))}
						</Tbody>
					</Table>
				</Box>
				<Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
					<Text fontSize="sm" color={textColor}>
						Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} restaurants
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

			{/* Toast Container */}
			<ToastContainer />

			{/* Edit Restaurant Modal */}
			<Modal isOpen={isEditModalOpen} onClose={onModalClose} size="xl">
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
						<FormControl mb={4}>
							<FormLabel>Details</FormLabel>
							<Textarea
								name="details"
								value={formData.details}
								onChange={handleInputChange}
								placeholder="Enter restaurant details"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Opening Time (HH:MM)</FormLabel>
							<Input
								name="opening_time"
								value={formData.opening_time}
								onChange={handleInputChange}
								placeholder="e.g., 09:00"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Closing Time (HH:MM)</FormLabel>
							<Input
								name="closing_time"
								value={formData.closing_time}
								onChange={handleInputChange}
								placeholder="e.g., 07:00"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Tax Rate (%)</FormLabel>
							<Input
								name="tax_rate"
								type="number"
								step="0.01"
								value={formData.tax_rate}
								onChange={handleInputChange}
								placeholder="Enter tax rate"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Rating (0-5)</FormLabel>
							<Input
								name="rating"
								type="number"
								step="0.1"
								value={formData.rating}
								onChange={handleInputChange}
								placeholder="Enter rating"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Location Address</FormLabel>
							<Input
								name="locationAddress"
								value={formData.locationAddress}
								onChange={handleInputChange}
								placeholder="Enter location address"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Latitude</FormLabel>
							<Input
								name="latitude"
								type="number"
								step="any"
								value={formData.latitude}
								onChange={handleInputChange}
								placeholder="Enter latitude"
							/>
						</FormControl>
						<FormControl mb={4} isRequired>
							<FormLabel>Longitude</FormLabel>
							<Input
								name="longitude"
								type="number"
								step="any"
								value={formData.longitude}
								onChange={handleInputChange}
								placeholder="Enter longitude"
							/>
						</FormControl>
						<FormControl mb={4}>
							<FormLabel>Restaurant Image</FormLabel>
							{imagePreview && (
								<Image
									src={imagePreview}
									alt="Restaurant Preview"
									maxW="150px"
									mb={2}
									borderRadius="8px"
									objectFit="cover"
								/>
							)}
							<Input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								p={1}
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
						<Button variant="ghost" onClick={onModalClose} isDisabled={isSubmitting}>
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
								<Flex flexDirection="column" alignItems="center" mb={4}>
									<Text fontSize="lg" fontWeight="bold" mr={2}>
										{selectedRestaurantDetails.name}
									</Text>
									{selectedRestaurantDetails.image && (
										<Image
											src={selectedRestaurantDetails.image}
											alt={selectedRestaurantDetails.name}
											maxW="100px"
											borderRadius="8px"
											objectFit="cover"
											fallbackSrc="https://via.placeholder.com/100?text=No+Image"
										/>
									)}
									<Text fontSize="sm" mb={2}>
										<strong>Details:</strong> {selectedRestaurantDetails.details || 'N/A'}
									</Text>
									<Text fontSize="sm" mb={2}>
										<strong>Opening Time:</strong> {selectedRestaurantDetails.opening_time || 'N/A'}
									</Text>
									<Text fontSize="sm" mb={2}>
										<strong>Closing Time:</strong> {selectedRestaurantDetails.closing_time || 'N/A'}
									</Text>
									<Text fontSize="sm" mb={2}>
										<strong>Location Address:</strong> {selectedRestaurantDetails.locationAddress || 'N/A'}
									</Text>
									<Text fontSize="sm" mb={2}>
										<strong>Coordinates:</strong> ({selectedRestaurantDetails.latitude}, {selectedRestaurantDetails.longitude})
									</Text>
									<Text fontSize="sm" mb={2}>
										<strong>Active:</strong> {selectedRestaurantDetails.isActive ? true : false}
									</Text>
								</Flex>
								<Text fontSize="sm" mb={2}>
									<strong>SUBCATEGORIES:</strong>
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
																<Td>₹{item.price}</Td>
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
						<Button variant="ghost" onClick={() => setIsDetailsModalOpen(false)}>
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
