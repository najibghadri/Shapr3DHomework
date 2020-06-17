import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuButton,
  Flex,
  MenuItem,
  MenuList,
  Icon,
  useToast,
} from "@chakra-ui/core";
import axios from "axios";

var endpoint = "https://quarantime.io/shapr";

function UploadForm(props) {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState(null);
  const [txid, setTxid] = useState(null);
  const toast = useToast();

  const onFile = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const uploadFile = (txid) => {
    const data = new FormData();
    data.append("file", file);
    data.append("txid", txid);
    axios
      .post(endpoint + "/upload", data, {
        headers: {
          txid: txid,
        },
      })
      .then((response) => {
        setFile(null);
        setTarget(null);
        setTxid(null);
        props.setConversions((conversions) =>
          Object.assign({}, conversions, { [response.data.id]: response.data })
        );
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
    } else {
      postConversionTx();
    }
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

export default UploadForm;
