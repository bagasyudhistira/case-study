const jobApiUrl = "http://localhost:8082/job";
const jobTableBody = document.querySelector("#job-list");

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

// Function to Fetch and Display All Jobs
async function fetchAllJobs() {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`${jobApiUrl}/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch jobs");

    const data = await response.json();
    populateJobTable(data.content);

    if ($.fn.dataTable.isDataTable("#jobTable")) {
      $("#jobTable").DataTable().destroy();
    }
    $("#jobTable").DataTable(); // Initialize DataTable
  } catch (error) {
    console.error(error);
    alert("Failed to fetch jobs. Please try again.");
  }
}

// Function to Search for a Job by ID
async function searchJob() {
  const token = validateToken();
  if (!token) return;

  const jobId = document.getElementById("search-item").value.trim();

  if (!jobId) {
    alert("Please enter a job ID to search.");
    return;
  }

  try {
    const response = await fetch(`${jobApiUrl}/id/${jobId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error Response:", errorMessage);
      throw new Error("Job not found");
    }

    const data = await response.json();
    if (data) {
      populateJobTable([data]); // Populate table with the searched job
    } else {
      jobTableBody.innerHTML =
        '<tr><td colspan="5">No job found with this ID</td></tr>';
    }
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    jobTableBody.innerHTML = '<tr><td colspan="5">Job not found</td></tr>';
  }
}

// Function to Populate the Table with Job Data
function populateJobTable(jobs) {
  jobTableBody.innerHTML = ""; // Clear previous table content

  if (!jobs || jobs.length === 0) {
    jobTableBody.innerHTML = '<tr><td colspan="5">No jobs found</td></tr>';
    return;
  }

  jobs.forEach((job) => {
    const row = `
        <tr>
          <td>${job.job_id || "-"}</td>
          <td>${job.job_title || "-"}</td>
          <td>${job.min_salary || "-"}</td>
          <td>${job.max_salary || "-"}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editJob('${
              job.job_id
            }')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteJob('${
              job.job_id
            }')">Delete</button>
          </td>
        </tr>`;
    jobTableBody.innerHTML += row;
  });
}

async function deleteJob(id) {
  const token = validateToken();
  if (!token) return;

  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    const response = await fetch(`${jobApiUrl}/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete job");

    fetchAllJobs();
  } catch (error) {
    console.error(error);
    alert("Failed to delete job. Please try again.");
  }
}

// Function to Reset the Search and Fetch All Jobs
function clearSearch() {
  document.getElementById("search-item").value = ""; // Clear search input
  fetchAllJobs(); // Repopulate table with all jobs
}

// Initial Load of All Jobs
document.addEventListener("DOMContentLoaded", () => {
  fetchAllJobs();
});

function showJobModal(job) {
  const form = document.getElementById("jobForm");
  const jobIdInput = document.getElementById("job_id");

  if (job) {
    // Populate fields for editing
    console.log(form, form.first_name);
    form.job_title.value = job.job_title || "";
    form.min_salary.value = job.min_salary || "";
    form.max_salary.value = job.max_salary || "";
    jobIdInput.value = job.job_id; // Hidden input for ID
  } else {
    // Clear fields for creating a new job
    form.reset();
    jobIdInput.value = ""; // Ensure ID is cleared
  }
  document.getElementById("jobForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = validateToken();
    if (!token) return;

    const formData = new FormData(e.target);
    const jobData = Object.fromEntries(formData.entries());
    const id = document.getElementById("job_id").value; // Get ID for update

    try {
      const response = await fetch(
        jobApiUrl + (id == job.job_id ? `/update/${id}` : "/save"),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobData), // Convert data to JSON
        }
      );
      console.log(JSON.stringify(jobData));
      console.log("API Response Status:", await JSON.stringify(response));

      if (!response.ok) {
        throw new Error(id ? "Failed to update job" : "Failed to save job");
      }

      // Close the modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("jobModal")
      );
      modal.hide();

      // Refresh the job list
      fetchAllJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to save job. Please try again.");
    }
  });

  // Open the modal using Bootstrap's Modal class
  const modal = new bootstrap.Modal(document.getElementById("jobModal"));
  modal.show();
}

// Create/Update Job
document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = validateToken();
  if (!token) return;

  const formData = new FormData(e.target);
  const jobData = Object.fromEntries(formData.entries());
  const id = document.getElementById("job_id").value; // Get ID for update

  try {
    const response = await fetch(jobApiUrl + (id ? `/update/${id}` : "/save"), {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(), // Convert data to JSON
    });

    console.log("API Response Status:", response.content);

    if (!response.ok) {
      throw new Error(id ? "Failed to update job" : "Failed to save job");
    }

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("jobModal")
    );
    modal.hide();

    // Refresh the job list
    fetchAllJobs();
  } catch (error) {
    console.error(error);
    alert("Failed to save job. Please try again.");
  }
});

// Fetch and Populate Job for Editing
async function editJob(id) {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`${jobApiUrl}/id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch job details");

    const job = await response.json();
    // alert(JSON.stringify(job.content));
    showJobModal(job.content); // Pass job data to the modal
  } catch (error) {
    console.error("Error fetching job details:", error);
    alert("Failed to fetch job details. Please try again.");
  }
}

// ----------------- ----------------- ----------------- CREATE  ----------------- ----------------- ----------------- //

function showJobModalCreate(job) {
  const form = document.getElementById("jobFormCreate");
  const jobIdInput = document.getElementById("job_id");

  if (job) {
    // Populate fields for editing
    console.log(form, form.first_name);
    form.job_title.value = job.job_title || "";
    form.min_salary.value = job.min_salary || "";
    form.max_salary.value = job.max_salary || "";
    jobIdInput.value = job.job_id; // Hidden input for ID
  } else {
    // Clear fields for creating a new job
    form.reset();
    jobIdInput.value = ""; // Ensure ID is cleared
  }
  document.getElementById("jobForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = validateToken();
    if (!token) return;

    const formData = new FormData(e.target);
    const jobData = Object.fromEntries(formData.entries());
    const id = document.getElementById("job_id").value; // Get ID for update

    console.log(JSON);
    try {
      const response = await fetch(jobApiUrl + "/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData), // Convert data to JSON
      });
      console.log(JSON.stringify(jobData));
      console.log("API Response Status:", await JSON.stringify(response));

      if (!response.ok) {
        throw new Error(id ? "Failed to update job" : "Failed to save job");
      }

      // Close the modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("jobModal")
      );
      modal.hide();

      // Refresh the job list
      fetchAllJobs();
    } catch (error) {
      console.error(error);
      alert("Failed to save job. Please try again.");
    }
  });

  // Fetch and Populate Job for Editing
  //   async function editJob(id) {
  //     const token = validateToken();
  //     if (!token) return;

  //     try {
  //       const response = await fetch(`${jobApiUrl}/id/${id}`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (!response.ok) throw new Error("Failed to fetch job details");

  //       const job = await response.json();
  //       // alert(JSON.stringify(job.content));
  //       showJobModal(job.content); // Pass job data to the modal
  //     } catch (error) {
  //       console.error("Error fetching job details:", error);
  //       alert("Failed to fetch job details. Please try again.");
  //     }
  //   }
  // Open the modal using Bootstrap's Modal class
  const modal = new bootstrap.Modal(document.getElementById("jobModal"));
  modal.show();
}

// Create/Update Job
document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = validateToken();
  if (!token) return;

  const formData = new FormData(e.target);
  const jobData = Object.fromEntries(formData.entries());
  const id = document.getElementById("job_id").value; // Get ID for update

  try {
    const response = await fetch(jobApiUrl + (id ? `/update/${id}` : "/save"), {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(), // Convert data to JSON
    });

    console.log("API Response Status:", response.content);

    if (!response.ok) {
      throw new Error(id ? "Failed to update job" : "Failed to save job");
    }

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("jobModal")
    );
    modal.hide();

    alert("Job saved successfully");

    // Refresh the job list
    fetchAllJobs();
  } catch (error) {
    console.error(error);
    alert("Failed to save job. Please try again.");
  }
});
