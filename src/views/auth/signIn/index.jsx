import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

const baseUrl = process.env.REACT_APP_BASE_URL;

function SignIn() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const [show, setShow] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const handleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Determine if input is email or mobile
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrMobile);
      const formattedMobile = emailOrMobile.replace(/\D/g, "");
      const payload = isEmail
        ? { email: emailOrMobile, password }
        : { mobile: formattedMobile.length === 10 ? `${formattedMobile}` : formattedMobile, password };

      // console.log("Sending payload:", payload);

      // Make API call
      const response = await axios.post(
        `${baseUrl}api/user/login`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("API response:", response.data);

      // Check if login was successful
      if (response.data.status === true) {
        // Store token and user data
        localStorage.setItem("token", response.data.user.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // console.log("Login successful:", response.data.user);

        // Navigate to admin/default
        navigate("/admin/dashboard");
      } else {
        // Handle OTP or other errors
        if (response.data.message === "OTP not verified.") {
          setError(`OTP not verified. Please verify using OTP: ${response.data.otp}`);
          // Optionally redirect to an OTP verification page
          // navigate("/auth/verify-otp", { state: { mobile: payload.mobile, otp: response.data.otp } });
        } else {
          throw new Error(response.data.message || "Authentication failed");
        }
      }
    } catch (err) {
      console.error("Error:", err.response || err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultAuth
      illustrationBackground={illustration}
      image={illustration}
      hideBackButton={true}
    >
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Sign In
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Enter your email/mobile and password to sign in!
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: "100%", md: "420px" }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: "auto", lg: "unset" }}
          me="auto"
          mb={{ base: "20px", md: "auto" }}
        >
          <Flex align="center" mb="25px">
            <HSeparator />
            <Text color="gray.400" mx="14px">
              or
            </Text>
            <HSeparator />
          </Flex>
          <FormControl>
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Email or Mobile<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              variant="auth"
              fontSize="sm"
              ms={{ base: "0px", md: "0px" }}
              type="text"
              placeholder="mail@simmmple.com or 1234567890"
              mb="24px"
              fontWeight="500"
              size="lg"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              isDisabled={isLoading}
            />
            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired={true}
                fontSize="sm"
                placeholder="Min. 8 characters"
                mb="24px"
                size="lg"
                type={show ? "text" : "password"}
                variant="auth"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isDisabled={isLoading}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: "pointer" }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>
            {error && (
              <Text color="red.500" mb="24px" fontSize="sm">
                {error}
              </Text>
            )}
            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              onClick={handleSignIn}
              isLoading={isLoading}
              isDisabled={isLoading || !emailOrMobile || !password}
            >
              Sign In
            </Button>
          </FormControl>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;