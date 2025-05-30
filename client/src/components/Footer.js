import React from "react";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation("Common");
  return (
    <footer role="contentinfo" className="footer bg-white pt-4 pb-4">
    </footer>
  );
};
