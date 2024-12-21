<template>
  <div class="home-page">
    <h1>Welcome to My Audio Recording App!</h1>
    <p>This app lets you record audio, upload chunks, and merge them into a single file.</p>

    <h2>My Projects</h2>
    <div class="projects">
      <div class="project-card" v-for="(project, index) in projects" :key="index">
        <h3>{{ project.title }}</h3>
        <p>{{ project.description }}</p>
      </div>
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
