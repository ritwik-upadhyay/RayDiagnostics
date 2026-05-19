from __future__ import annotations

from pathlib import Path

import torch
from torch import nn


DEFAULT_MODEL_PATH = Path(
    "/Users/ritwikupadhyay/Desktop/GAN CT Enhancement Project/generator_final.pth"
)


class Generator(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.model = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=4, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 1, kernel_size=4, stride=2, padding=1),
            nn.Tanh(),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.model(inputs)


def load_generator(model_path: Path | None = None) -> tuple[Generator, Path]:
    resolved_path = Path(model_path or DEFAULT_MODEL_PATH).expanduser().resolve()
    if not resolved_path.exists():
        raise FileNotFoundError(
            f"Generator checkpoint not found at {resolved_path}."
        )

    state_dict = torch.load(resolved_path, map_location="cpu")
    model = Generator()
    model.load_state_dict(state_dict)
    model.eval()
    return model, resolved_path
