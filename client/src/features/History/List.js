import React from "react";
import { ListItem } from "./ListItem";

export const List = ({ list, onClick }) => (
  <tbody>
    {list.map(item => (
      <ListItem key={item.envelopeId} item={item} onClick={onClick} />
    ))}
  </tbody>
);
