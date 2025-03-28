// utils/apiHeaders.ts
const getAuthHeaders = (isJson: boolean = true) => {
    const token = localStorage.getItem("token") || "";
    const headers = {
      ...(isJson && { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
    };
    console.log("Headers enviados:", headers);
    return headers;
  };
  