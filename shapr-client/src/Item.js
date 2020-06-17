import React, { useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  Progress,
} from "@chakra-ui/core";
import axios from "axios";

var endpoint = "https://quarantime.io/shapr";
let timeout = null

function Item(props) {
  useEffect(() => {
    
    const update = () => {
      axios
        .get(endpoint + "/conversion/" + props.conversion.id)
        .then(function (response) {
          props.setConversions((conversions) =>
            Object.assign({}, conversions, {
              [response.data.id]: response.data,
            }) 
          );
          if (response.data.status === 0 || response.data.status === 1) {
            timeout = setTimeout(update, 1500);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(function () {});
    };

    if (props.conversion.status === 0 || props.conversion.status === 1) {
      update();
    }

    return () => {
        clearTimeout(timeout)
    }
  }, []);

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
    <Box mt="0.75rem" className="convitem">
      {props.conversion.status === 3 && (
        <Text fontWeight="700" color="Red">
          Failed
        </Text>
      )}
      <Flex mb="4px" flexWrap="wrap">
        <Text className="secondary" fontWeight="500">
          Created: {date}
        </Text>
        {donedate}
        <Text ml="2rem" className="secondary" fontWeight="500">
          ID: {props.conversion.id}
        </Text>
      </Flex>
      <Flex>
        {props.conversion.input_file ? (
          <a
            href={
              endpoint +
              "/files/" +
              props.conversion.id +
              "/" +
              props.conversion.input_file
            }
          >
            <Button rightIcon="download" className="btnsecondary">
              {props.conversion.input_file}
            </Button>
          </a>
        ) : (
          <Button rightIcon="download" isDisabled className="btnsecondary">
            Uploading...
          </Button>
        )}

        {props.conversion.status === 2 ? (
          <a
            style={{ marginLeft: "0.5rem" }}
            href={
              endpoint +
              "/files/" +
              props.conversion.id +
              "/" +
              props.conversion.output_file
            }
          >
            <Button rightIcon="download" className="btnprimary">
              {props.conversion.output_file}
            </Button>
          </a>
        ) : null}
      </Flex>
      {(props.conversion.status === 0 || props.conversion.status === 1) && (
        <Progress
          mt="1rem"
          className="progressbar"
          value={props.conversion.progress ? props.conversion.progress : 0}
          hasStripe
          isAnimated
        />
      )}
    </Box>
  );
}


export default Item;
