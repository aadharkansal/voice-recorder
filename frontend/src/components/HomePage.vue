<template>
  <div class="home-page">
    <h1>Welcome to My Audio Recording App!</h1>
    <p>This app lets you record audio, upload chunks, and merge them into a single file.</p>

    <h2>My Previous Projects</h2>
      <div class="projects">
        <h3>Designed Scalable Backend Services</h3>
        <p>
          Built backend systems integrating multiple LLMs across regions, cutting downtime by 99% and saving $10K monthly, with automation reducing developer effort by 90%.
        </p>
      </div>
      <div class="projects">
        <h3>Optimized Data Processing and Retrieval</h3>
        <p>
          Developed AWS Lambda-based ingestion pipelines, cutting SageMaker costs by 85%, and implemented hybrid Weaviate search, boosting retrieval accuracy by 38% for 20Mn documents.
        </p>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projects: [
        { title: 'Audio Recorder', description: 'A web app for recording and merging audio chunks.' },
        { title: 'Music Player', description: 'An app to play music from S3 storage.' },
      ],
    };
  },
};
</script>

<style scoped>
.home-page {
  text-align: center;
  padding: 20px;
}

.projects {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.project-card {
  border: 1px solid #ddd;
  padding: 20px;
  margin: 10px;
  max-width: 200px;
  text-align: left;
}
</style>
