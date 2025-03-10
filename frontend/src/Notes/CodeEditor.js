import React, { useState } from 'react';
import './CodeEditor.css'; // Updated to match the correct CSS file

const CodeEditor = () => {
  const [code, setCode] = useState('');

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const executeCode = async () => {
    try {
      // Use a web worker or a safe execution environment for multiple languages
      const result = await executeInSandbox(code);
      alert(`🚀 Output: ${result}`);
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    }
  };

  const executeInSandbox = (code) => {
    return new Promise((resolve, reject) => {
      // Simulate a futuristic code execution environment
      const worker = new Worker('path/to/your/worker.js'); // Create a web worker for code execution
      worker.postMessage(code); // Send code to the worker

      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      };

      worker.onerror = (error) => {
        reject(new Error(error.message));
      };
    });
  };

  return (
    <div className="coder-container">
      <h2>📝 Galactic Code Console</h2>
      <textarea 
        value={code} 
        onChange={handleCodeChange} 
        rows="15" 
        placeholder="🚀 Type your code here... (supports multiple languages!)"
        className="code-input"
        onCopy={(e) => e.preventDefault()} // Prevent copy
        onPaste={(e) => e.preventDefault()} // Prevent paste
      />
      <button className="execute-button" onClick={executeCode}>🚀 Launch Code</button>
    </div>
  );
};

export default CodeEditor;
