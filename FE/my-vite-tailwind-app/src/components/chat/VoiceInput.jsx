import React, { useState, useRef, useEffect } from "react";
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Stop,
  VolumeUp,
  Error,
} from "@mui/icons-material";

const VoiceInput = ({ onVoiceMessage, isConnected, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        processAudio(blob);
      };

      // Start recording
      mediaRecorder.start();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const processAudio = async (blob) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result.split(',')[1];
        
        // Send to parent component
        if (onVoiceMessage) {
          onVoiceMessage(base64Audio);
        }
        
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        setError('Failed to process audio data');
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(blob);

    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Voice Recording Button */}
      <Tooltip title={isRecording ? "Stop recording" : "Start voice input"}>
        <IconButton
          onClick={handleClick}
          disabled={disabled || isProcessing || !isConnected}
          sx={{
            color: isRecording ? 'error.main' : 'primary.main',
            backgroundColor: isRecording ? 'error.light' : 'transparent',
            '&:hover': {
              backgroundColor: isRecording ? 'error.main' : 'primary.light',
              color: isRecording ? 'white' : 'primary.contrastText',
            },
            transition: 'all 0.2s ease-in-out',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        >
          {isProcessing ? (
            <CircularProgress size={20} />
          ) : isRecording ? (
            <Stop />
          ) : (
            <Mic />
          )}
        </IconButton>
      </Tooltip>

      {/* Recording Status */}
      {isRecording && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 50%': { opacity: 1 },
                '51%, 100%': { opacity: 0.3 },
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Recording {formatTime(recordingTime)}
          </Typography>
        </Box>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Processing voice...
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            py: 0, 
            px: 1, 
            fontSize: '0.75rem',
            '& .MuiAlert-message': { py: 0.5 }
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <Tooltip title="Not connected to server">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Error color="warning" sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default VoiceInput;
