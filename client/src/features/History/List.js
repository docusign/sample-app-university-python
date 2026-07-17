import React from "react";
import { ListItem } from "./ListItem";

export const List = ({ list, onClick }) => (
  <tbody>
    {list.map(item => (
      <ListItem key={item.envelopeId || item.envelope_id} item={item} onClick={onClick} />
    ))}
  </tbody>
);
