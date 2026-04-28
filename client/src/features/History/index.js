import React, { useState, useEffect } from "react";
import { List } from "./List";
import { ApiDescription } from "./components/ApiDescription";
import { useTranslation } from "react-i18next";
import * as studentsAPI from "../../api/studentsAPI";
import { download } from "../../api/download";

const WEB_SOCKET_LINK_EVENTS = process.env.REACT_APP_WEB_SOCKET_LINK;

export const History = () => {
  const { t } = useTranslation("History");
  const [submissionsList, setSubmissionsList] = useState([]);

  useEffect(() => {
    if (!WEB_SOCKET_LINK_EVENTS) {
      return undefined;
    }

    let socket;
    let reconnectTimeout;
    let isClosed = false;

    const connect = () => {
      if (isClosed) {
        return;
      }

      socket = new WebSocket(WEB_SOCKET_LINK_EVENTS);

      socket.onmessage = async (message) => {
        try {
          const payload = JSON.parse(message.data);
          if (Array.isArray(payload)) {
            setSubmissionsList(payload);
            return;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message: ", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error: ", error);
        socket.close();
      };

      socket.onclose = () => {
        if (!isClosed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      isClosed = true;
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.close();
      }
    };
  }, []);

  async function onClick(event) {
    try {
      const data = await studentsAPI.getStatusDocument(
        event.envelopeId,
        event.documentId
      );

      download(
        data,
        `${event.envelopeId} - ${event.documentId}`,
        event.extention,
        event.mimeType
      );
    } catch (error) {
      throw error;
    }
  }

  if (submissionsList.length === 0) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="text-center">
            <br></br>
            <h3>{t("EmptyListMessage")}</h3>
            <br></br>
          </div>
        </div>
      </div>
    );
  }
  return (
    <section className="container-fluid content-section">
      <h2 className="h2">{t("SubmissionsStatus")}</h2>
      <div className="row">
        <div className="col-lg-7">
          <div className="table-holder">
            <table className="table table-striped history-table">
              <thead>
                <tr>
                  <th scope="col">{t("Applicant")}</th>
                  <th scope="col">{t("Subject")}</th>
                  <th scope="col">{t("Status")}</th>
                  <th scope="col">{t("Last Updated")}</th>
                  <th scope="col" className="text-right">{t("Actions")}</th>
                ``<th scope="col"> </th>
                </tr>
              </thead>
              <List list={submissionsList} onClick={onClick} />
            </table>
          </div>
        </div>
        <ApiDescription />
      </div>
    </section>
  );
};