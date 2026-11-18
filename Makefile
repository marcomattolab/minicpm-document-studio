.PHONY: setup backend frontend office sdk llm ocr start-backend start-frontend dev health

# Install everything (backend + frontend + LibreOffice + OCR SDK + llama.cpp/models)
setup:
	./scripts/setup.sh all

backend:
	./scripts/setup.sh backend

frontend:
	./scripts/setup.sh frontend

office:
	./scripts/setup.sh office

sdk:
	./scripts/setup.sh sdk

llm:
	./scripts/setup.sh llm

# Run the OCR inference service (llama.cpp) in the foreground
ocr:
	./scripts/start_ocr.sh

start-backend:
	./scripts/start_backend.sh

start-frontend:
	./scripts/start_frontend.sh

# Avvia tutti e 3 i servizi insieme (Ctrl+C per fermarli)
dev:
	./scripts/dev.sh

health:
	./scripts/health.sh
