import { spawn } from 'child_process';

// Every single route file in your project
const servers = [
  'routes/adaptivePlanRoutes.js',
  'routes/chatbot.js',
  'routes/compiler.js',
  'routes/course.js',
  'routes/explainRoutes.js',
  'routes/quiz.js',
  'routes/resumeRecruiterRoutes.js',
  'routes/roadmap.js',
  'routes/topicCompareRoutes.js',
  'routes/authRoutes.js'
];

servers.forEach((file) => {
  const child = spawn('node', [file], { stdio: 'inherit' });

  child.on('error', (err) => {
    console.error(`Failed to start ${file}:`, err);
  });
});

console.log('🚀 Booting up all servers...');
