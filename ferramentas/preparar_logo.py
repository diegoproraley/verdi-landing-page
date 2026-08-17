"""
Prepara a logo OFICIAL da Verdi para a web.

Regra desta pasta: a arte não é editada. Sem recorte, sem remoção de fundo,
sem mudança de cor. O arquivo só é redimensionado (mantendo a proporção) e
comprimido, porque servir uma imagem de 1179px onde ela aparece a 60px
desperdiça banda do cliente.

O fundo creme da arte é o mesmo #F9EDDD usado no cabeçalho, no selo do rodapé
e no avatar do atendimento — por isso a logo encaixa sem borda aparente.
"""
import os
from PIL import Image

ORIGEM = '/mnt/user-data/uploads/WhatsApp_Image_2026-08-15_at_20_03_42.jpeg'
DESTINO = '../img'
CREME = (249, 237, 221)

os.makedirs(DESTINO, exist_ok=True)
original = Image.open(ORIGEM).convert('RGB')
print(f'arte original: {original.size[0]}x{original.size[1]}')

for nome, largura, qualidade in [('logo-verdi.jpg', 720, 86), ('logo-verdi-sm.jpg', 320, 82)]:
    alt = round(original.height * largura / original.width)
    img = original.resize((largura, alt), Image.LANCZOS)
    caminho = f'{DESTINO}/{nome}'
    img.save(caminho, 'JPEG', quality=qualidade, optimize=True, progressive=True)
    print(f'{nome:22s} {largura}x{alt}  {os.path.getsize(caminho) // 1024} KB')

for nome, lado in [('favicon.png', 128), ('icone-ios.png', 180)]:
    caminho = f'{DESTINO}/{nome}'
    original.resize((lado, lado), Image.LANCZOS).save(caminho, optimize=True)
    print(f'{nome:22s} {lado}x{lado}  {os.path.getsize(caminho) // 1024} KB')

og = Image.new('RGB', (1200, 630), CREME)
og.paste(original.resize((560, 560), Image.LANCZOS), (10, 35))
foto = Image.open(f'{DESTINO}/hero-salada.jpg').convert('RGB')
larg, alt = 620, 630
escala = max(larg / foto.width, alt / foto.height)
f = foto.resize((int(foto.width * escala) + 1, int(foto.height * escala) + 1), Image.LANCZOS)
f = f.crop(((f.width - larg) // 2, (f.height - alt) // 2,
            (f.width - larg) // 2 + larg, (f.height - alt) // 2 + alt))
og.paste(f, (580, 0))
og.save(f'{DESTINO}/og-verdi.jpg', 'JPEG', quality=84, optimize=True)
print(f'og-verdi.jpg           1200x630  {os.path.getsize(DESTINO + "/og-verdi.jpg") // 1024} KB')
