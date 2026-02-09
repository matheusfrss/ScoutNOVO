<<<<<<< HEAD
# check_app.py — testa a importação de backend/app.py
import importlib, traceback

importlib.invalidate_caches()
print("Tentando importar módulo 'app' a partir de", __file__)
try:
    import app as mod
    print("IMPORT: OK")
    print("Arquivo carregado ->", getattr(mod, "__file__", None))
    print("Tem atributo 'app'? ->", hasattr(mod, "app"))
    print("Tipo de 'app' ->", type(getattr(mod, "app", None)))
    print("Alguns nomes no módulo:", [n for n in dir(mod) if not n.startswith('__')][:60])
except Exception:
    print("ERRO ao importar 'app':")
    traceback.print_exc()
=======
# check_app.py — testa a importação de backend/app.py
import importlib, traceback

importlib.invalidate_caches()
print("Tentando importar módulo 'app' a partir de", __file__)
try:
    import app as mod
    print("IMPORT: OK")
    print("Arquivo carregado ->", getattr(mod, "__file__", None))
    print("Tem atributo 'app'? ->", hasattr(mod, "app"))
    print("Tipo de 'app' ->", type(getattr(mod, "app", None)))
    print("Alguns nomes no módulo:", [n for n in dir(mod) if not n.startswith('__')][:60])
except Exception:
    print("ERRO ao importar 'app':")
    traceback.print_exc()
>>>>>>> a5211762a9944bfbbd72e6d04a523b4f63b2378f
