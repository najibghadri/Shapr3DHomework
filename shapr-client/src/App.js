import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Box,
  Heading,
  Image,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Divider,
  Icon,
  useToast,
  Progress,
} from "@chakra-ui/core";
import axios from "axios";

var endpoint = "http://localhost:3000/shapr";

function UploadForm(props) {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState(null);
  const [txid, setTxid] = useState(null);
  const toast = useToast();

  const onFile = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = (txid) => {
    const data = new FormData();
    data.append("file", file);
    data.append("txid", txid);
    axios.post(endpoint + "/upload", data, {}).then((res) => {
      setFile(null);
      setTarget(null);
      setTxid(null);
    });
  };

  const postConversionTx = () => {
    let data = {
      targettype: target,
    };
    axios
      .post(endpoint + "/conversion", data)
      .then((res) => {
        setTxid(res.data.id);
        uploadFile(res.data.id);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const onClick = (e) => {
    if (file === null || target === null) {
      toast({
        title: "Oops..",
        description: "Select a file and target type to convert to.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    postConversionTx();
  };

  return (
    <Flex
      flexWrap="wrap"
      alignItems="center"
      mt="1.5rem"
      justifyContent="center"
    >
      <label htmlFor="file-upload" className="btnprimary upload-button">
        <Icon name="add"></Icon>{" "}
        {file === null ? <span>Choose file</span> : file.name}
      </label>
      <input
        id="file-upload"
        type="file"
        name="input"
        accept=".shapr"
        onChange={onFile}
      />
      <Menu>
        <MenuButton
          as={Button}
          className="btnprimary"
          mx="1px"
          rightIcon="chevron-down"
        >
          {target === null ? "to" : "to " + target}
        </MenuButton>
        <MenuList placement="bottom-start">
          <MenuItem onClick={() => setTarget("step")}>.step</MenuItem>
          <MenuItem onClick={() => setTarget("iges")}>.iges</MenuItem>
          <MenuItem onClick={() => setTarget("stl")}>.stl</MenuItem>
          <MenuItem onClick={() => setTarget("obj")}>.obj</MenuItem>
        </MenuList>
      </Menu>
      <Button className="btnprimary" onClick={onClick}>
        Convert
      </Button>
    </Flex>
  );
}

function Item(props) {
  let date = new Date(props.conversion.created_at).toLocaleString();
  let donedate = null;
  if (props.conversion.finished_at) {
    donedate = (
      <Text ml="2rem" className="secondary" fontWeight="500">
        Finished: {new Date(props.conversion.finished_at).toLocaleString()}
      </Text>
    );
  }
  return (
    <Box mt="1rem" className="convitem">
      <Flex mb="4px" flexWrap="wrap">
        <Text className="secondary" fontWeight="500">
          Created: {date}
        </Text>
        {null}
        <Text ml="2rem" className="secondary" fontWeight="500">
          ID: {props.conversion.id}
        </Text>
      </Flex>
      <Flex>
        <Button rightIcon="download" className="btnsecondary">
          Download
        </Button>
        <Button rightIcon="download" className="btnsecondary">
          Download
        </Button>
      </Flex>
      <Progress
        mt="1rem"
        className="progressbar"
        value={80}
        hasStripe
        isAnimated
      />
    </Box>
  );
}

function Section(props) {
  return (
    <Box>
      {Object.keys(props.list).length > 0 && (
        <Heading className="darktxt" as="h2">
          {props.title}
        </Heading>
      )}

      {Object.values(props.list).map((conversion) => (
        <Item key={conversion.id} conversion={conversion}></Item>
      ))}
    </Box>
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
        console.log(response.data);
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
        Hello Shapr3D User,
      </Heading>
      <Heading className="darktxt" as="h1" size="xl" mt="0.5rem">
        Convert files
      </Heading>
      <UploadForm />
      <Text mt="0.5rem" textAlign="center" className="secondary">
        Supported input type: .shapr, supported output types: .step, .iges,
        .stl, .obj
      </Text>
      <Text textAlign="center" className="secondary" fontWeight="600">
        Name your file "fail.shapr" to trigger a fail.
      </Text>

      <Divider />

      <Section title="Failed" conversions={conversions} list={failed} />
      <Section title="Queued" conversions={conversions} list={queued} />
      <Section
        title="In-progress"
        conversions={conversions}
        list={inprogress}
      />
      <Section title="Completed" conversions={conversions} list={completed} />
    </Box>
  );
}

export default App;
