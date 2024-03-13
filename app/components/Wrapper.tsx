import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { fetchOpenAIResponse } from '../utils/fetchOpenAIResponse';
import RequestForm from './RequestForm';

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState<string>();
  const [interviewData, setInterviewData] = useState({
    jobDescriptionText: '',
    interviewType: '',
    resumeText: '',
    payment: '',
  });

  useEffect(() => {
    const startInterview = async (text: string) => {
      const messageToSend = `INTERVIEW TYPE: ${interviewData.interviewType}
------------
PAYMENT: ${interviewData.payment}
------------
RESUME: ${text}
------------
JOB DESCRIPTION: ${interviewData.jobDescriptionText}
------------`;
      await fetchOpenAIResponse([{role: 'user', content: messageToSend }], (msg) => setInitialText(msg));
    }

    if (isLoading && interviewData.resumeText !== '' && interviewData.resumeText !== undefined) {
      startInterview(interviewData.resumeText).then(() => {
        setIsLoading(false);
        setShowChat(true);
      });
    }
  }, [interviewData.resumeText]);

  return (
    <div className="form-wrapper">
      <p className="instructions-text">{!showChat ? 'Start the interview with Bob The Interviewer.' : 'Answer Bob\'s questions.'}</p>
      {!showChat ? (
        <div className='request-form-wrapper'>
          <RequestForm interviewData={interviewData} setIsLoading={setIsLoading} setInterviewData={setInterviewData} />
          {isLoading && <div className="loading-spinner"></div>}
        </div>
      ) : (
        <Chat initialText={initialText} interviewData={interviewData} />
      )}
    </div>
  );
};

export default ResumeUploader;
