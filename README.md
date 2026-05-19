# RayDiagnostics

RayDiagnostics now includes a live Python backend that loads your GAN generator checkpoint and feeds the existing frontend with real reconstruction results.

## Run locally

1. Create the Python environment if needed:
   `python3 -m venv .venv`
2. Install backend dependencies:
   `./.venv/bin/pip install -r requirements.txt`
3. Install frontend dependencies if needed:
   `npm install`
4. Start the full stack:
   `npm run dev`

Frontend:
`http://127.0.0.1:5173`

Backend:
`http://127.0.0.1:8001`

## Model path

By default the backend loads:

`/Users/ritwikupadhyay/Desktop/GAN CT Enhancement Project/generator_final.pth`

You can override that with:

`RAYDIAGNOSTICS_MODEL_PATH=/absolute/path/to/generator_final.pth npm run dev`

## Supported uploads

- DICOM (`.dcm`, `.dicom`)
- PNG
- JPG / JPEG
- WEBP
- BMP
