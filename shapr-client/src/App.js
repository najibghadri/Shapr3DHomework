import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Image,
  Flex,
  Text,
  Divider,
} from "@chakra-ui/core";
import axios from "axios";

import Item from './Item';
import UploadForm from './UploadForm';

var endpoint = "https://quarantime.io/shapr";

function dateSort(a, b) {
  return new Date(b.created_at) - new Date(a.created_at);
}

function Section(props) {
  return (
    Object.keys(props.list).length > 0 && (
      <Box mb="2rem">
        <Heading className="darktxt" as="h2">
          {props.title}
        </Heading>

        {Object.values(props.list)
          .sort(dateSort)
          .map((conversion) => (
            <Item
              key={conversion.id}
              setConversions={props.setConversions}
              conversion={conversion}
            ></Item>
          ))}
      </Box>
    )
  );
}

function App() {
  const [conversions, setConversions] = useState({});
  const [queued, setQueued] = useState({});
  const [inprogress, setInprogress] = useState({});
  const [failed, setFailed] = useState({});
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    let queued = {};
    let inprogress = {};
    let failed = {};
    let completed = {};
    Object.values(conversions).forEach((conversion) => {
      switch (conversion.status) {
        case 0:
          queued[conversion.id] = conversion;
          break;
        case 1:
          inprogress[conversion.id] = conversion;
          break;
        case 2: 
          completed[conversion.id] = conversion;
          break;
        case 3:
          failed[conversion.id] = conversion;
          break;
        default:
          break;
      }
    });
    setQueued(queued);
    setInprogress(inprogress);
    setCompleted(completed);
    setFailed(failed);
  }, [conversions]);

  useEffect(() => {
    axios
      .get(endpoint + "/conversion")
      .then(function (response) {
        let conversions = {};
        response.data.forEach((conversion) => {
          conversions[conversion.id] = conversion;
        });
        setConversions(conversions);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  }, []);

  return (
    <Box maxWidth="48rem" px="2rem" mx="auto" mt="2rem" mb="3rem">
      <Flex alignItems="center">
        <Image src="/logo.png" height="3rem" />
      </Flex>
      <Heading className="darktxt" as="h1" size="lg" mt="0.5rem">
        Hello Shapr3D User
      </Heading>
      <Heading className="darktxt" as="h1" size="xl" mt="0.5rem">
        Convert files
      </Heading>
      <UploadForm setConversions={setConversions} />
      <Text mt="0.5rem" textAlign="center" className="secondary">
        Supported input type: .shapr, supported output types: .step, .iges,
        .stl, .obj
      </Text>
      <Text textAlign="center" className="secondary" fontWeight="600">
        Name your file "fail.shapr" to trigger a fail.
      </Text>

      <Divider />

      <Section title="Queued" setConversions={setConversions} list={queued} />
      <Section
        title="In-progress"
        setConversions={setConversions}
        list={inprogress}
      />
      <Section title="Failed" setConversions={setConversions} list={failed} />
      <Section
        title="Completed"
        setConversions={setConversions}
        list={completed}
      />
    </Box>
  );
}

export default App;
