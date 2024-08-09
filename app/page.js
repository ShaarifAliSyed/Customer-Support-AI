'use client'
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I'm a support agent that specializes in electronics, home appliances, and accessories. How can I assist you today?`
    },
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent empty messages

    // Update the messages state with the user's message and a placeholder for the assistant's response
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    setMessage(''); // Clear the input field

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }])
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      reader.read().then(function processText({ done, value }) {
        if (done) {
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, content: result },
            ];
          });
          return;
        }
        result += decoder.decode(value || new Int8Array(), { stream: true });
        reader.read().then(processText);
      });

    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' }
      ]);
    }
  };

  return (
    <Box 
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack 
          direction="column" 
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display='flex'
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box bgcolor={
                message.role === 'assistant' ? 'primary.main' : 'secondary.main'
              }
              color="white"
              borderRadius={16}
              p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
