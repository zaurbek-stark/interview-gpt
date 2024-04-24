import React, { useState } from 'react';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';
import { processHtmlToText } from '../utils/processHtmlToText';

type InterviewData = {
  jobDescriptionText: string;
  interviewType: string;
  resumeText: string;
  payment: string;
};

type Props = {
  interviewData: InterviewData;
  setInterviewData: React.Dispatch<React.SetStateAction<InterviewData>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const RequestForm: React.FC<Props> = ({interviewData, setInterviewData, setIsLoading}) => {
  const { interviewType } = interviewData;
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
  const [error, setError] = useState('');

  const mergeTextContent = (textContent: TextContent) => {
    return textContent.items.map(item => {
      const { str, hasEOL } = item as TextItem
      return str + (hasEOL ? '\n' : '')
    }).join('')
  }

  const readResume = async (pdfFile: File | undefined) => {    
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    
    if (!pdfFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result;
      if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
        const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
        loadingTask.promise.then((pdfDoc) => {
          pdfDoc.getPage(1).then((page) => {
            page.getTextContent().then((textContent) => {
              const extractedText = mergeTextContent(textContent);
              setInterviewData(data => ({
                ...data,
                resumeText: extractedText
              }));
            });
          });
        }, (reason) => {
          console.error(`Error during PDF loading: ${reason}`);
        });
      }
    };
    reader.readAsArrayBuffer(pdfFile);
  }

  const scrapeJobDescription = async (url: string) => {
    const response = await fetch(`/api/scrapper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const responseData = await response.json();
    const textContent = processHtmlToText(responseData.textContent);
    setInterviewData(data => ({
      ...data,
      jobDescriptionText: textContent
    }));
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setIsLoading(true);
    setInterviewData(data => ({
      ...data,
      resumeText: ''
    }));

    try {
      const file = event.target.files?.[0];
      if (!file) {
        setError('The PDF wasn\'t uploaded correcty.');
        setIsLoading(false);
        return;
      }
      await scrapeJobDescription(jobDescriptionUrl);
      await readResume(file);
    } catch (error) {
      setError('There was an error reading the resume. Please try again.');
    }
  };

  return (
    <div>
      <div className="input-group">
        <label htmlFor="job-input" className="input-label">⚔️ Job description</label>
        <input
          className="input-style"
          name="job-input"
          type="url"
          placeholder="Drop the url here"
          value={jobDescriptionUrl}
          onChange={(e) => setJobDescriptionUrl(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="interview-type" className="input-label">🧠 Interview Type</label>
        <select 
          className="input-style"
          name="interview-type"
          value={interviewType} 
          onChange={(e) => setInterviewData(data => ({
          ...data,
          interviewType: e.target.value
        }))}>
          <option value="">Select Interview Type</option>
          <option value="behavioral">Behavioral</option>
          <option value="leetcode">Leetcode</option>
          <option value="project">Project</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="payment" className="input-label">😐 How much will you pay me</label>
        <input
          className="input-style"
          name="payment"
          type="text"
          placeholder="The more money the better I will help"
          value={interviewData.payment}
          onChange={(e) => setInterviewData(data => ({
            ...data,
            payment: e.target.value
          }))}
        />
      </div>
      <div className="file-upload-btn-container">
        <input type="file" id="file-upload" onChange={handleResumeUpload} accept="application/pdf" hidden />
        <label htmlFor="file-upload" className="label-style main-btn">⚡️ Upload Resume</label>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default RequestForm;
