<template>
  <div class="recording-page">
    <div class="header">
      <h1>Audio Recorder</h1>
      <p>Record, upload, and merge your audio chunks.</p>
    </div>

    <div class="recording-controls">
      <div v-if="!isRecording" class="button-container">
        <button @click="startRecording" class="start-btn">Start Recording</button>
      </div>

      <div v-else>
        <button @click="stopRecording" class="stop-btn">Stop Recording</button>
      </div>

      <div class="duration-container">
        <label for="chunkDuration">Select Chunk Duration (seconds):</label>
        <input
          type="number"
          id="chunkDuration"
          v-model="chunkDuration"
          min="1"
          max="60"
          class="duration-input"
        />
      </div>
    </div>

    <div v-if="audioChunks.length" class="chunks">
      <h2>Recorded Chunks</h2>
      <div class="chunk-list">
        <div class="chunk-card" v-for="(chunk, index) in audioChunks" :key="index">
          <div class="chunk-info">
            <strong>Chunk {{ index + 1 }}:</strong>
            <span>{{ chunk.duration }} seconds</span>
          </div>
        </div>
      </div>

      <div class="chunks-summary">
        <p>Total recording time: {{ totalRecordingTime }} seconds</p>
        <p>Total chunks generated: {{ totalChunks }}</p>
      </div>

      <button @click="mergeAndUploadChunks" class="merge-btn">Merge and Upload</button>
    </div>

    <div v-if="isMerging" class="merging-status">
      <p>Uploading and merging...</p>
    </div>

    <div v-if="mergedAudioUrl" class="audio-player-container">
      <h3>Retrieved Merged Audio:</h3>
      <audio controls>
        <source :src="mergedAudioUrl" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
</template>

<script>
import RecordRTC from 'recordrtc';
import axiosInstance from '../axios';

export default {
  data() {
    return {
      isRecording: false,
      recorder: null,
      audioChunks: [],
      isMerging: false,
      chunkDuration: 10, // Default chunk duration in seconds (Updated to 10 seconds)
      totalRecordingTime: 0, // Will calculate actual total recording time
      totalChunks: 0,
      mergedAudioUrl: null,
      stream: null,
      startTime: null, // Track the start time of the recording
    };
  },
  methods: {
    // Start recording with RecordRTC
    startRecording() {
      this.audioChunks = [];
      this.totalRecordingTime = 0;
      this.totalChunks = 0;
      this.startTime = Date.now(); // Record start time

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          this.stream = stream;

          // Create a new RecordRTC instance
          this.recorder = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            timeSlice: this.chunkDuration * 1000, // Time slice in milliseconds (e.g., 10 seconds)
            ondataavailable: (blob) => {
              const chunkDuration = this.chunkDuration;
              const chunk = {
                blob: blob,
                duration: chunkDuration, // Set chunk duration as expected (for initial chunks)
              };

              // Push the chunk to the array
              this.audioChunks.push(chunk);
              this.totalChunks = this.audioChunks.length;
            },
          });

          this.recorder.startRecording();
          this.isRecording = true;
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
        });
    },

    // Stop recording
    stopRecording() {
      this.isRecording = false;
      this.recorder.stopRecording(() => {
        this.stream.getTracks().forEach(track => track.stop()); // Stop the microphone stream

        // Calculate the actual duration of each chunk
        const endTime = Date.now();
        const lastChunk = this.audioChunks[this.audioChunks.length - 1];
        const actualDuration = Math.round((endTime - this.startTime) / 1000);

        // Adjust the last chunk's duration based on the actual recording time
        if (this.audioChunks.length > 0) {
          lastChunk.duration = actualDuration % this.chunkDuration;
        }

        // Recalculate the total recording time by summing up each chunk's actual duration
        this.totalRecordingTime = this.audioChunks.reduce((acc, chunk) => acc + chunk.duration, 0);
      });
    },

    // Merge and upload chunks to the backend
    mergeAndUploadChunks() {
      this.isMerging = true;

      const formData = new FormData();
      this.audioChunks.forEach((chunk, index) => {
        formData.append(`chunk_${index}`, chunk.blob, `chunk_${Date.now() + index}.wav`);
      });

      axiosInstance.post('/api/v1/audio/add', formData)
        .then(() => {
          console.log('Chunks uploaded successfully');
          this.isMerging = false;
          this.fetchMergedAudio();
        })
        .catch((error) => {
          console.error('Error uploading chunks', error);
          this.isMerging = false;
        });
    },

    // Fetch the merged audio from the backend
    fetchMergedAudio() {
      axiosInstance.get('/api/v1/audio/remove')
        .then((response) => {
          this.mergedAudioUrl = response.data.audioUrl; // Assume S3 URL is returned
        })
        .catch((error) => {
          console.error('Error fetching audio', error);
        });
    },
  },
};
</script>

<style scoped>
.recording-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: #f4f7fa;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
}

.recording-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.button-container {
  margin-bottom: 20px;
}

.start-btn, .stop-btn, .merge-btn {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-btn:hover, .stop-btn:hover, .merge-btn:hover {
  background-color: #0056b3;
}

.duration-container {
  margin-top: 10px;
  text-align: center;
}

.duration-input {
  width: 60px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chunks {
  margin-top: 30px;
  text-align: center;
}

.chunk-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chunk-card {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 10px;
  margin: 5px 0;
  width: 200px;
  border-radius: 8px;
  text-align: left;
}

.chunks-summary {
  margin-top: 20px;
  font-size: 16px;
  color: #333;
}

.merging-status {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.audio-player-container {
  margin-top: 30px;
  text-align: center;
}

audio {
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
}
</style>
