const jobHisAllApiUrl = "http://localhost:8082/job-hist-all";
const jobHisTableBody = document.querySelector("#job-history-list");

// Utility Function to Validate Token
function validateToken() {
  const token = localStorage.getItem("authToken");
  if (!token || token.trim() === "") {
    console.log("Token is missing or empty. Redirecting to login.");
    window.location.href = "../pages/login.html";
    return false;
  }
  return token;
}

// Function to Fetch and Display All Departments
async function fetchAllJobHistories() {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`${jobHisAllApiUrl}/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch departments");

    const data = await response.json();
    populateJobHisTable(data.content);

    if ($.fn.dataTable.isDataTable("#jobHistoryTable")) {
      $("#jobHistoryTable").DataTable().destroy();
    }
    $("#jobHistoryTable").DataTable(); // Initialize DataTable
  } catch (error) {
    console.error(error);
    alert("Failed to fetch departments. Please try again.");
  }
}

// Function to Populate the Table with Department Data
function populateJobHisTable(jobHis) {
  jobHisTableBody.innerHTML = ""; // Clear previous table content

  if (!jobHis || jobHis.length === 0) {
    jobHisTableBody.innerHTML =
      '<tr><td colspan="5">No departments found</td></tr>';
    return;
  }

  jobHis.forEach((jH) => {
    const row = `
          <tr>
            <td>${jH.full_name || "-"}</td>
            <td>${jH.start_date || "-"}</td>
            <td>${jH.end_date || "-"}</td>
            <td>${jH.job_title || "-"}</td>
            <td>${jH.department_name || "-"}</td>
          </tr>`;
    jobHisTableBody.innerHTML += row;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAllJobHistories();
});
