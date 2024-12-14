import os
import json
from pathlib import Path

def generate_dreamvault_structure(root_path):
    structure = {}
    root = Path(root_path)

    for dream_node in root.iterdir():
        if dream_node.is_dir() and not dream_node.name.startswith('.'):
            node_structure = {
                "name": dream_node.name,
                "dreamtalk": None,
                "readme": None
            }

            # Check for Dreamtalk (GIF or PNG)
            for ext in ['.gif', '.png']:
                dreamtalk = dream_node / f"dreamtalk{ext}"
                if dreamtalk.exists():
                    node_structure["dreamtalk"] = str(dreamtalk.relative_to(root))
                    break

            # Check for README
            readme = dream_node / "README.md"
            if readme.exists():
                node_structure["readme"] = str(readme.relative_to(root))

            structure[dream_node.name] = node_structure

    return structure

if __name__ == "__main__":
    dreamvault_path = Path("DreamVault")
    structure = generate_dreamvault_structure(dreamvault_path)
    
    with open("backend/dreamvault_structure.json", "w") as f:
        json.dump(structure, f, indent=2)

    print("DreamVault structure has been generated and saved to dreamvault_structure.json")
