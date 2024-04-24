# InterviewGPT

This chatbot will help you prepare for your next behavioral interview! Just upload your resume pdf and let Bob The Interview start asking you questions.

This project is built using Nextjs. It utilizes the Llama 3 70B model for chat completion. The resume pdf is handled by PDF.js which extracts all the text from the document.

<img src="interviewgpt-demo.gif" alt="app demo" width=600>

## Getting Started

First, duplicate the `.env` file into a new file named `.env.local`. Update the value of your keys there.

The first time you are running this project, you will need to install the dependencies. Run this command in your terminal:

```bash
yarn
```

To start the app, run:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
