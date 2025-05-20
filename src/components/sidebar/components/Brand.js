import React from "react";

// Chakra imports
import { Flex, Heading, useColorModeValue } from "@chakra-ui/react";

// Custom components

import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align='center' direction='column'>
     <Heading as="h2" fontSize="2xl" color={logoColor} my="32px">
        Hunger Safari
      </Heading>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;

