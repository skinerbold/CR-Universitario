#!/usr/bin/env python3
"""
Script para gerar ícones PWA em diferentes tamanhos a partir de um SVG base.
Requer cairosvg e Pillow: pip install cairosvg Pillow
"""

import os
from pathlib import Path

try:
    import cairosvg
    from PIL import Image
except ImportError:
    print("Instalando dependências necessárias...")
    os.system("pip install cairosvg Pillow")
    import cairosvg
    from PIL import Image

def generate_png_icons():
    """Gera ícones PNG em diferentes tamanhos a partir do SVG base."""
    
    # Tamanhos necessários para PWA
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    # Caminhos
    svg_path = Path("public/icons/icon-base.svg")
    icons_dir = Path("public/icons")
    
    if not svg_path.exists():
        print(f"Erro: Arquivo SVG não encontrado em {svg_path}")
        return False
    
    # Criar diretório se não existir
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    print("Gerando ícones PNG...")
    
    for size in sizes:
        output_path = icons_dir / f"icon-{size}x{size}.png"
        
        try:
            # Converter SVG para PNG
            cairosvg.svg2png(
                url=str(svg_path),
                write_to=str(output_path),
                output_width=size,
                output_height=size
            )
            
            print(f"✓ Gerado: {output_path.name} ({size}x{size})")
            
        except Exception as e:
            print(f"✗ Erro ao gerar {output_path.name}: {e}")
            return False
    
    # Gerar favicon.ico (16x16, 32x32, 48x48)
    try:
        favicon_sizes = [16, 32, 48]
        favicon_images = []
        
        for size in favicon_sizes:
            temp_png = icons_dir / f"temp_{size}.png"
            cairosvg.svg2png(
                url=str(svg_path),
                write_to=str(temp_png),
                output_width=size,
                output_height=size
            )
            favicon_images.append(Image.open(temp_png))
        
        # Salvar como ICO
        favicon_path = Path("public/favicon.ico")
        favicon_images[0].save(
            favicon_path,
            format='ICO',
            sizes=[(16, 16), (32, 32), (48, 48)]
        )
        
        # Limpar arquivos temporários
        for size in favicon_sizes:
            temp_png = icons_dir / f"temp_{size}.png"
            temp_png.unlink(missing_ok=True)
        
        print(f"✓ Gerado: favicon.ico")
        
    except Exception as e:
        print(f"✗ Erro ao gerar favicon.ico: {e}")
    
    print("\n🎉 Ícones PWA gerados com sucesso!")
    return True

if __name__ == "__main__":
    generate_png_icons()
