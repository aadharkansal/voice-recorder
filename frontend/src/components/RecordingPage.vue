<template>
  <div class="recording-page">
    <div class="header">
      <h1>Audio Recorder</h1>
      <p>Record, upload, and merge your audio chunks.</p>
    </div>

    

    <div class="recording-controls">
      <div v-if="!isRecording" class="button-container">
        <button @click="startRecording" class="start-btn">
          Start Recording
        </button>
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
        <div
          class="chunk-card"
          v-for="(chunk, index) in audioChunks"
          :key="index"
        >
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

      <button @click="mergeAndUploadChunks" class="merge-btn">
        Upload
      </button>
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
    <MergeAudio />
  </div>
</template>

<script>
import RecordRTC from "recordrtc";
import axiosInstance from "../axios";
import MergeAudio from "./MergeAudio.vue";

export default {
  data() {
    return {
      isRecording: false,
      recorder: null,
      audioChunks: [],
      isMerging: false,
      chunkDuration: 10, // Default chunk duration in seconds
      totalRecordingTime: 0,
      totalChunks: 0,
      mergedAudioUrl: null,
      stream: null,
      startTime: null,
    };
  },
  methods: {
    startRecording() {
      this.audioChunks = [];
      this.totalRecordingTime = 0;
      this.totalChunks = 0;
      this.startTime = Date.now(); 

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.stream = stream;

          // Create a new RecordRTC instance
          this.recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm", 
            timeSlice: this.chunkDuration * 1000, 
            ondataavailable: (blob) => {
              const currentTime = Date.now();
              const elapsedTime = Math.round(
                (currentTime - this.startTime) / 1000
              );

              // Calculate chunk duration
              const chunkDuration = Math.min(
                this.chunkDuration,
                elapsedTime - this.totalRecordingTime
              );

              if (chunkDuration > 0) {
                this.audioChunks.push({
                  blob: blob,
                  duration: chunkDuration,
                });

                this.totalChunks = this.audioChunks.length;
                this.totalRecordingTime += chunkDuration;

                console.log(
                  `Recorded chunk duration: ${chunkDuration} seconds`
                );
              }
            },
          });

          this.recorder.startRecording();
          this.isRecording = true;
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    },

    // Stop recording
    stopRecording() {
      this.isRecording = false;
      this.recorder.stopRecording(() => {
        this.stream.getTracks().forEach((track) => track.stop()); // Stop the microphone stream

        const endTime = Date.now();
        const totalElapsedTime = Math.round((endTime - this.startTime) / 1000);

        if (this.audioChunks.length > 0) {
          const lastChunk = this.audioChunks[this.audioChunks.length - 1];
          const recordedTime = this.audioChunks.reduce(
            (acc, chunk) => acc + chunk.duration,
            0
          );
          const adjustment = totalElapsedTime - recordedTime;

          if (adjustment > 0 && adjustment <= this.chunkDuration) {
            lastChunk.duration += adjustment;
            this.totalRecordingTime += adjustment;
          }
        }

        console.log("Final recording time:", this.totalRecordingTime);
        console.log(
          "All chunk durations:",
          this.audioChunks.map((chunk) => chunk.duration)
        );
      });
    },

    // Convert Blob to Base64
    async convertBlobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1]; // Extract Base64 string
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },

    async mergeAndUploadChunks() {
      try {
        this.isMerging = true;

        if (this.audioChunks.length === 0) {
          throw new Error("No audio chunks available to upload.");
        }

        // Convert all chunks to Base64
        const binaryChunks = await Promise.all(
          this.audioChunks.map((chunk) => this.convertBlobToBase64(chunk.blob))
        );

        const payload = {
          timestamp: Date.now(),
          chunks: binaryChunks,
        };

        await axiosInstance.post("/api/v1/audio/add", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        alert("Audio uploaded successfully!");
      } catch (error) {
        console.error("Error during merge or upload:", error);
        alert("Failed to merge or upload audio.");
      } finally {
        this.isMerging = false;
      }
    },
  },
  components: {
    MergeAudio,
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

.start-btn,
.stop-btn,
.merge-btn {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-btn:hover,
.stop-btn:hover,
.merge-btn:hover {
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
