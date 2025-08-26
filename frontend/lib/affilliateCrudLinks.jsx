import React, { useEffect, useState } from "react";
import api from "../../lib/api";

// MUI Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";

const LinksModal = ({ setAffiliateLinksModal }) => {
  const [links, setLinks] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedSlug, setEditedSlug] = useState("");

  const fetchLinks = async () => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await api.get("/affiliate/user/affiliatelinks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLinks(response.data);
      console.log(response);
    } catch (error) {
      console.error("Failed to fetch affiliate links:", error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDelete = async (affiliateId) => {
    const token = localStorage.getItem("access_token");

    try {
      await api.delete(`/affiliate/delete-link/${affiliateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLinks(links.filter((link) => link.affiliate_id !== affiliateId));
      fetchLinks();
    } catch (error) {
      console.log(error);
      console.error("Failed to delete link:", error);
    }
  };

  const handleEdit = (link) => {
    setEditMode(link.affiliate_id);
    setEditedSlug(link.custom_slug);
  };

  const handleSave = async (link) => {
    try {
      const resp = await api.put(`/affiliate/edit-link/${link.affiliate_id}`, {
        custom_slug: editedSlug,
        affiliate_id: link.affiliate_id,
        email: link.email,
        product_id: link.product_id,
        link: link.link,
      });
      console.log(resp);
      fetchLinks();
      setEditMode(null);
    } catch (error) {
      console.error("Failed to update custom slug:", error);
    }
  };

  // Function to copy the generated link to the clipboard
  const handleCopy = (affiliateId, customSlug) => {
    const link = `https://backend.capitalkv.com/?affiliate_id=${affiliateId}&custom_slug=${customSlug}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        console.log("Link copied to clipboard");
        alert("Link copied to clipboard!"); // Optional alert for user feedback
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
      });
  };

  return (
    <Dialog
      open={true}
      onClose={() => setAffiliateLinksModal(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Affiliate Links
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => setAffiliateLinksModal(false)}
          aria-label="close"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {links?.map((link) => (
            <ListItem key={link.affiliate_id} divider>
              {editMode === link.affiliate_id ? (
                <TextField
                  value={editedSlug}
                  onChange={(e) => setEditedSlug(e.target.value)}
                  fullWidth
                  label="Custom Slug"
                />
              ) : (
                <ListItemText
                  primary={`https://backend.capitalkv.com/?affiliate_id=${link.affiliate_id}&custom_slug=${link.custom_slug}`} // Display the full link
                />
              )}

              {editMode === link.affiliate_id ? (
                <IconButton
                  edge="end"
                  aria-label="save"
                  onClick={() => handleSave(link)}
                >
                  <SaveIcon />
                </IconButton>
              ) : (
                <>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEdit(link)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(link.affiliate_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="copy"
                    onClick={() =>
                      handleCopy(link.affiliate_id, link.custom_slug)
                    } // Call copy function
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAffiliateLinksModal(false)} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinksModal;
