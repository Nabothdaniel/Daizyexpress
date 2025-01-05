import React, { useEffect, useState } from "react";
import { Table, Button, Skeleton, Empty, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useAuth } from "../../Context/useContext";
import { toast } from "react-toastify";

interface File {
  key: string;
  name: string;
  date: string;
  status: string;
  fileId: string; // Add fileId here for the download
}

interface FileListProps {
  isHome: boolean;
}

const FileList: React.FC<FileListProps> = ({ isHome }) => {
  const { token } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null); 
  const API_BASE_URL = "https://daizyexserver.vercel.app";


  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/files/user-files`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedFiles = data.files.map((file: any, index: number) => ({
            key: String(index + 1),
            name: file.fileName,
            date: new Date(file.uploadedAt).toLocaleString(),
            status: file.status,
            fileId: file._id,
          }));
          setFiles(formattedFiles);
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to fetch files.");
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("An error occurred while fetching files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [token]);

  // Download file handler with loading state
  const downloadFile = async (fileId: string, name: string) => {
    try {
      setLoadingDownload(fileId); 

      const response = await fetch(`${API_BASE_URL}/api/files/download/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name; 
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to download file.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("An error occurred while downloading the file.");
    } finally {
      setLoadingDownload(null); 
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="text-gray-800 font-medium text-base sm:text-lg">{name}</span>
      ),
    },
    {
      title: "Date and Time",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span className="text-gray-600 text-sm sm:text-base">{date}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-full font-semibold text-sm sm:text-base ${
            status === "processed"
              ? "bg-green-100 text-green-600"
              : status === "in process"
              ? "bg-orange-100 text-orange-600"
              : status === "not processed"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: File) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          disabled={record.status !== "processed" || loadingDownload === record.fileId} // Disable if not processed or if already downloading
          className="text-blue-500"
          onClick={() => downloadFile(record.fileId, record.name)} // Call downloadFile with fileId
        >
          {loadingDownload === record.fileId ? (
            <Spin size="small" />
          ) : (
            "Download"
          )}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Document Table {isHome ? "" : ""}
        </h2>
        <Table
          dataSource={loading ? [] : files}
          columns={columns}
          pagination={{ pageSize: 5 }}
          className="rounded-lg shadow bg-white"
          locale={{
            emptyText: loading ? (
              <div className="flex items-center justify-center">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ) : (
              <Empty description="No files found" />
            ),
          }}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default FileList;

