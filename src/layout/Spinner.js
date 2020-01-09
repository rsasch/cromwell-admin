import React from 'react';
import BarLoader from 'react-spinners/BarLoader';

const Spinner = (props) => {
  return <BarLoader
      css="margin: 0 auto;"
      height="10px"
      width="400px"
      color={"#ccc"}
      loading={props.loading}
    />
}

export default Spinner;
