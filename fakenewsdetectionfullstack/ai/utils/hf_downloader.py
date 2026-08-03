from __future__ import annotations

import os
from pathlib import Path

from huggingface_hub import hf_hub_download, snapshot_download


HF_REPO_ID = os.getenv("HF_REPO_ID")
HF_TOKEN = os.getenv("HF_TOKEN")


class HFDownloader:

    @staticmethod
    def _check_env():
        repo_id = os.getenv("HF_REPO_ID")
        token = os.getenv("HF_TOKEN")

        if not repo_id:
            raise RuntimeError("HF_REPO_ID environment variable not found.")

        return repo_id, token

    @staticmethod
    def ensure_transformer(model_name: str, destination: Path):

    
        if destination.exists():
            return
    
        repo_id, token = HFDownloader._check_env()
        destination.parent.mkdir(parents=True, exist_ok=True)
    
        print(f"[HF] Downloading transformer: {model_name}")
    
        snapshot_download(
            repo_id=repo_id,
            repo_type="model",
            token=token,
            allow_patterns=[f"transformers/{model_name}/*"],
            local_dir=str(destination.parent),
        )
    
        downloaded = destination.parent / "transformers" / model_name
    
        if downloaded.exists():
            import shutil
    
            shutil.move(str(downloaded), str(destination))
    
            try:
                shutil.rmtree(destination.parent / "transformers")
            except Exception:
                pass
    
        print(f"[HF] Finished downloading {model_name}")




    @staticmethod
    def ensure_ml_file(filename: str, destination: Path):
    
        if destination.exists():
            return

        repo_id, token = HFDownloader._check_env()
    
        destination.parent.mkdir(parents=True, exist_ok=True)
    
        print(f"[HF] Downloading ML file: {filename}")
    
        hf_hub_download(
            repo_id=repo_id,
            repo_type="model",
            filename=f"ml/{filename}",
            token=token,
            local_dir=str(destination.parent),
        )
    
        downloaded = destination.parent / "ml" / filename
    
        if downloaded.exists():
            import shutil
    
            shutil.move(str(downloaded), str(destination))
    
            try:
                shutil.rmtree(destination.parent / "ml")
            except Exception:
                pass
    
        print(f"[HF] Finished downloading {filename}")

    @staticmethod
    def ensure_dl_file(filename: str, destination: Path):
    
        if destination.exists():
            return

        repo_id, token = HFDownloader._check_env()
    
        destination.parent.mkdir(parents=True, exist_ok=True)
    
        print(f"[HF] Downloading DL file: {filename}")
    
        hf_hub_download(
            repo_id=repo_id,
            repo_type="model",
            filename=f"dl/{filename}",
            token=token,
            local_dir=str(destination.parent),
        )
    
        downloaded = destination.parent / "dl" / filename
    
        if downloaded.exists():
            import shutil
    
            shutil.move(str(downloaded), str(destination))
    
            try:
                shutil.rmtree(destination.parent / "dl")
            except Exception:
                pass
    
        print(f"[HF] Finished downloading {filename}")

    @staticmethod
    def ensure_root_tokenizer(destination: Path):

        if destination.exists():
            return

        repo_id, token = HFDownloader._check_env()

        destination.parent.mkdir(parents=True, exist_ok=True)

        print("[HF] Downloading tokenizer.pkl")

        hf_hub_download(
            repo_id=repo_id,
            repo_type="model",
            filename="tokenizer.pkl",
            token=token,
            local_dir=str(destination.parent),
            local_dir_use_symlinks=False,
        )
