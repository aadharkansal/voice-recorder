<template>
    <div class="audio-merge">
      <h1>Merge and Play Audio</h1>
      <form @submit.prevent="fetchPresignedUrl">
        <label for="timestamp">Enter Timestamp:</label>
        <input
          type="text"
          id="timestamp"
          v-model="timestamp"
          placeholder="Enter timestamp"
          required
        />
        <button type="submit">Merge and Get URL</button>
      </form>
  
      <div v-if="isLoading" class="loading">Processing your request...</div>
  
      <!-- Display Pre-signed URL -->
      <div v-if="presignedUrl" class="url-display">
        <h3>Pre-signed URL:</h3>
        <a :href="presignedUrl" target="_blank">{{ presignedUrl }}</a>
      </div>
  
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </template>
  
  <script>
  import axiosInstance from "../axios";
  
  export default {
    data() {
      return {
        timestamp: "", 
        presignedUrl: null, 
        isLoading: false, 
        error: null, 
      };
    },
    methods: {
      async fetchPresignedUrl() {
        this.isLoading = true;
        this.error = null;
        this.presignedUrl = null;
  
        try {
          const response = await axiosInstance.post(`/api/v1/audio/merge/${this.timestamp}`);
          
          if (response.data && response.data.url) {
            this.presignedUrl = response.data.url;
          } else {
            throw new Error("No URL returned from the server.");
          }
        } catch (error) {
          console.error("Error fetching pre-signed URL:", error);
          this.error = "Failed to fetch the pre-signed URL. Please try again.";
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .audio-merge {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  
  form {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .loading {
    margin-top: 20px;
    font-size: 16px;
    color: #555;
  }
  
  .url-display {
    margin-top: 20px;
    word-break: break-word;
  }
  
  .error {
    margin-top: 20px;
    color: red;
  }
  </style>
  