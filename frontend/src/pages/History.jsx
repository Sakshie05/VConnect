import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contents/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { IconButton, Container, Box, Chip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HistoryIcon from "@mui/icons-material/History";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeeetings] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeeetings(history);
      } catch (err) {
        
      }
    };
    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 3,
            p: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <HistoryIcon sx={{ fontSize: 32, color: "#667eea" }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Meeting History
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              navigate("/home");
            }}
            sx={{
              backgroundColor: "#667eea",
              color: "white",
              "&:hover": {
                backgroundColor: "#764ba2",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <HomeIcon />
          </IconButton>
        </Box>

        {meetings.length !== 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {meetings.map((e, i) => {
              return (
                <Card
                  key={i}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <VideoCallIcon sx={{ color: "#667eea", fontSize: 28 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#2d3748",
                          }}
                        >
                          {e.meetingCode}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                        label={formatDate(e.date)}
                        sx={{
                          backgroundColor: "#f7fafc",
                          color: "#4a5568",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Card
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              p: 6,
              textAlign: "center",
            }}
          >
            <HistoryIcon sx={{ fontSize: 64, color: "#cbd5e0", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#718096", fontWeight: 500 }}>
              No meeting history yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#a0aec0", mt: 1 }}>
              Your past meetings will appear here
            </Typography>
          </Card>
        )}
      </Container>
    </Box>
  );
}