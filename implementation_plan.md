# Fix ML Pipeline, WebGL Errors, and Deployment Configuration

This plan addresses all the issues you reported, including the 500 Internal Server error on `/api/upload`, the WebGL Context Lost error on the frontend, and ensuring the ML pipeline is robust and free from 429 (Too Many Requests) errors in production.

## User Review Required

> [!IMPORTANT]
> **Deployment Configuration Requirements**
> For the Hugging Face (ML) and Render (Node) deployment to communicate properly, you must set these Environment Variables after we apply the code fixes:
> 
> **1. On Hugging Face Space Settings (Variables and secrets):**
> - `NODE_BACKEND_URL` = `https://<your-render-app-url>.onrender.com`
> - `MONGO_URI` = `mongodb+srv://rohanbhangale101022_db_user:YuM0OGbxsl4IPDTa@cluster0.ceugvau.mongodb.net/?appName=Cluster0`
> - `JWT_SECRET` = `ROHANBHANGALE2023.ROHAN.BHANGALE@ves.ac.in` (same as Node `.env`)
> - `GEMINI_API_KEY` = `AIzaSyDeaRnW8QHdn9Ly8xKQSNSdH6z9P8_RIBg` (same as Node `.env`)
> 
> **2. On Render Settings (Environment Variables):**
> - `ML_BACKEND_URL` = `https://rohan1022-automodel-ml.hf.space`

## Proposed Changes

---

### Backend (Node.js)

#### [MODIFY] `backend/controller/uploadController.js`
- **Fix the 500 error & Unhandled Rejection**: Currently, if the ML service returns an error (like 422), the backend attempts to delete the temporary file using `fs.unlinkSync()`. If the file doesn't exist or is already deleted, it crashes the stream handler, causing a 500 timeout. I will add a `fs.existsSync()` check.
- **Guarantee JSON Body**: I will switch the Axios call to the native `fetch` API. Axios is sometimes silently dropping the JSON body if it receives a 307 redirect from Hugging Face or encounters prototype issues, which causes FastAPI to respond with the `422 Unprocessable Entity (loc: ["body"])` error you saw.

---

### ML Backend (FastAPI / Python)

#### [MODIFY] `backend-ml/ml_services/app.py` & `hf_app.py`
- **Eliminate 429 Errors**: The current implementation uses the Groq API for insights. Groq has a very strict free tier limit which easily causes `429 Too Many Requests`. I will replace the Groq implementation with the Google Gemini (`gemini-1.5-flash`) API, utilizing the `GEMINI_API_KEY` you already have. Gemini Flash has a highly generous free tier (15 requests per minute, 1M tokens per minute) and will smoothly support your deployment without hitting rate limits.

---

### Frontend

#### [MODIFY] `frontend/src/components/Hero3DModel.tsx`
- **Fix THREE.WebGLRenderer Context Lost**: This error occurs when the 3D Canvas is unmounted quickly during navigation (e.g., to the Dashboard) or when WebGL memory is exhausted. I will add memory management properties to the `<Canvas>` (`dispose={null}`, `gl={{ powerPreference: 'high-performance' }}`) and implement an unmount cleanup strategy to gracefully dispose of WebGL contexts.

## Verification Plan

### Automated / Code Checks
- Run the Node.js test script to verify `fetch` successfully posts the JSON body to the FastAPI endpoint without throwing a missing body error.
- Verify that `fs.unlinkSync` doesn't crash the server by forcing an error.

### Manual Verification
1. I will execute the planned code modifications.
2. I will ask you to deploy these changes to Render and Hugging Face.
3. You will configure the Environment Variables listed in the **User Review Required** section.
4. Upload a dataset on the deployed URL to verify the 500 and 422 errors are completely resolved.
