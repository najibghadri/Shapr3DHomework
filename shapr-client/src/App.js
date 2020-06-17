import React, { useState, useEffect, useRef } from "react";
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
} from "@chakra-ui/core";
import axios from 'axios';

var endpoint = "http://localhost:3000/shapr/"

function UploadForm() {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState(null);

  const onFile = (e)=>{
    setFile(e.target.files[0])
  }

  const postConversionTx = () =>{
    let data = {
      target
    }
    axios.post(endpoint + "conversion", data, { 
      })
      .then(res => { 
        console.log(res.statusText)
      })
  }

  const onClick = (e)=>{
    const data = new FormData() 
    data.append('file', file)
  }

  return (
    <Flex mt="1.5rem" justifyContent="center">
      <label for="file-upload" className="btnprimary upload-button">
      <Icon name="add"></Icon> {file === null ? <span>Choose file</span> : file.name}
      </label>
      <input id="file-upload" type="file" name="input" accept=".shapr" onChange={onFile} />
      <Menu>
        <MenuButton
          as={Button}
          className="btnprimary"
          mx="1px"
          rightIcon="chevron-down"
        >
          {target ===null? "to" : "to " + target}
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => setTarget("step")}>.step</MenuItem>
          <MenuItem onClick={() => setTarget("iges")}>.iges</MenuItem>
          <MenuItem onClick={() => setTarget("stl")}>.stl</MenuItem>
          <MenuItem onClick={() => setTarget("obj")}>.obj</MenuItem>
        </MenuList>
      </Menu>
      <Button className="btnprimary" onClick={onClick}>Convert</Button>
    </Flex>
  );
}

function App() {
  const [queued, setQueued] = useState({});
  const [inprogress, setInprogress] = useState({});
  const [failed, setFailed] = useState({});
  const [completed, setCompleted] = useState({});

  useEffect(() => {}, []);

  return (
    <Box maxWidth="46rem" mx="auto" mt="2rem" mb="3rem">
      <Flex>
        <Image src="/logo.png" height="3rem" />
      </Flex>
      <Heading className="darktxt" as="h1" mt="0.5rem">
        Hello Shapr3D User,
      </Heading>
      <UploadForm/>
      <Text
        mt="0.5rem"
        textAlign="center"
        className="secondary"
        fontWeight="600"
      >
        Name your file "fail.shapr" to trigger a fail.
      </Text>
      <Text textAlign="center" className="secondary">
        Supported input type: .shapr, supported output types: .step, .iges,
        .stl, .obj
      </Text>
      <Flex mt="1rem" justifyContent="center">
        <Button rightIcon="download" className="btnsecondary">
          Download
        </Button>
      </Flex>
      <Divider />
      <Heading className="darktxt" as="h2">
        Failed
      </Heading>
      <Heading className="darktxt" as="h2">
        Queued
      </Heading>
      <Heading className="darktxt" as="h2">
        In-progress
      </Heading>
      <Heading className="darktxt" as="h2">
        Completed
      </Heading>
    </Box>
  );
}

export default App;
