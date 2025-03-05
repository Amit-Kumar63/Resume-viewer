#!/bin/bash

# Update package lists
apt-get update

# Install Tesseract OCR
apt-get install -y tesseract-ocr

# Continue with your build (if applicable)
npm install
