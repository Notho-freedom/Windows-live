import React from 'react';
import { GetIcon } from './LoardData';

const Folder = ({ name }) => (
  <div className="folder flex items-center gap-2 cursor-pointer">
    <GetIcon item={{ type: 'directory', name }} />
    <span className=" text-white truncate">{name}</span>
  </div>
);

export default Folder;
