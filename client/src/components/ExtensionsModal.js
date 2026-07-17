import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Button, Container } from "react-bootstrap";

export const ExtensionsModal = ({ show, onDownloadExtensions, onHide, title, message }) => {
   const { t } = useTranslation("Common");

  const handleContinue = () => {
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Container>
          <p dangerouslySetInnerHTML={{ __html: message }} />
        </Container>
      </Modal.Body>

      <Modal.Footer style={{ flexWrap: "inherit"}}>
        <Button className="btn btn-success" onClick={onDownloadExtensions} style={{ color: "white" }}>
          {t("DownloadExtensionsButton")}
        </Button>
        <Button className="btn btn-secondary" onClick={handleContinue}>
          {t("ContinueWithoutExtensionsButton")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};