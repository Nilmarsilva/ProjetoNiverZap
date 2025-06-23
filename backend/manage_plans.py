import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from tabulate import tabulate

# Carrega as variáveis de ambiente
load_dotenv()

def get_supabase_admin_client() -> Client:
    """Retorna um cliente Supabase com permissões de administrador"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def list_plans():
    """
    Lista todos os planos disponíveis
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        # Obtém todos os planos
        response = supabase.table("plans").select("*").order("id").execute()
        
        if hasattr(response, 'data') and len(response.data) > 0:
            # Prepara os dados para exibição em tabela
            table_data = []
            for plan in response.data:
                allowed_providers = json.dumps(plan['allowed_providers']) if isinstance(plan['allowed_providers'], list) else plan['allowed_providers']
                table_data.append([
                    plan['id'],
                    plan['name'],
                    plan['description'],
                    plan['type'],
                    f"R$ {plan['price']:.2f}",
                    plan['message_limit'],
                    allowed_providers,
                    "Ativo" if plan['is_active'] else "Inativo"
                ])
            
            # Exibe os planos em formato de tabela
            headers = ["ID", "Nome", "Descrição", "Tipo", "Preço", "Limite", "Provedores", "Status"]
            print("\nPlanos disponíveis:")
            print(tabulate(table_data, headers=headers, tablefmt="grid"))
            
            return response.data
        else:
            print("\nNenhum plano encontrado!")
            return []
    except Exception as e:
        print(f"\nErro ao listar planos: {e}")
        return []

def update_plan(plan_id, data):
    """
    Atualiza um plano existente
    
    Args:
        plan_id: ID do plano a ser atualizado
        data: Dicionário com os dados a serem atualizados
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        # Verifica se o plano existe
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        
        if not hasattr(response, 'data') or len(response.data) == 0:
            print(f"\nPlano com ID {plan_id} não encontrado!")
            return False
        
        # Atualiza o plano
        print(f"\nAtualizando plano com ID {plan_id}...")
        response = supabase.table("plans").update(data).eq("id", plan_id).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao atualizar plano: {response.error}")
            return False
        
        print("\nPlano atualizado com sucesso!")
        
        # Exibe os dados do plano atualizado
        if hasattr(response, 'data') and len(response.data) > 0:
            plan = response.data[0]
            print(f"\nID: {plan['id']}")
            print(f"Nome: {plan['name']}")
            print(f"Descrição: {plan['description']}")
            print(f"Tipo: {plan['type']}")
            print(f"Preço: R$ {plan['price']:.2f}")
            print(f"Limite de mensagens: {plan['message_limit']}")
            print(f"Provedores permitidos: {plan['allowed_providers']}")
            print(f"Status: {'Ativo' if plan['is_active'] else 'Inativo'}")
        
        return True
    except Exception as e:
        print(f"\nErro ao atualizar plano: {e}")
        return False

def create_plan(data):
    """
    Cria um novo plano
    
    Args:
        data: Dicionário com os dados do plano
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        # Cria o plano
        print("\nCriando novo plano...")
        response = supabase.table("plans").insert(data).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao criar plano: {response.error}")
            return False
        
        print("\nPlano criado com sucesso!")
        
        # Exibe os dados do plano criado
        if hasattr(response, 'data') and len(response.data) > 0:
            plan = response.data[0]
            print(f"\nID: {plan['id']}")
            print(f"Nome: {plan['name']}")
            print(f"Descrição: {plan['description']}")
            print(f"Tipo: {plan['type']}")
            print(f"Preço: R$ {plan['price']:.2f}")
            print(f"Limite de mensagens: {plan['message_limit']}")
            print(f"Provedores permitidos: {plan['allowed_providers']}")
            print(f"Status: {'Ativo' if plan['is_active'] else 'Inativo'}")
        
        return True
    except Exception as e:
        print(f"\nErro ao criar plano: {e}")
        return False

def delete_plan(plan_id):
    """
    Exclui um plano
    
    Args:
        plan_id: ID do plano a ser excluído
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        # Verifica se o plano existe
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        
        if not hasattr(response, 'data') or len(response.data) == 0:
            print(f"\nPlano com ID {plan_id} não encontrado!")
            return False
        
        # Verifica se há usuários usando este plano
        response = supabase.table("users").select("*").eq("plan_id", plan_id).execute()
        
        if hasattr(response, 'data') and len(response.data) > 0:
            print(f"\nNão é possível excluir o plano pois há {len(response.data)} usuários associados a ele!")
            print("Considere desativar o plano em vez de excluí-lo.")
            return False
        
        # Exclui o plano
        print(f"\nExcluindo plano com ID {plan_id}...")
        response = supabase.table("plans").delete().eq("id", plan_id).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao excluir plano: {response.error}")
            return False
        
        print("\nPlano excluído com sucesso!")
        return True
    except Exception as e:
        print(f"\nErro ao excluir plano: {e}")
        return False

def interactive_menu():
    """
    Menu interativo para gerenciar planos
    """
    while True:
        print("\n===== GERENCIAMENTO DE PLANOS =====")
        print("1. Listar planos")
        print("2. Atualizar plano")
        print("3. Criar novo plano")
        print("4. Desativar/Ativar plano")
        print("5. Excluir plano")
        print("0. Sair")
        
        option = input("\nEscolha uma opção: ")
        
        if option == "1":
            list_plans()
        
        elif option == "2":
            plans = list_plans()
            if plans:
                plan_id = int(input("\nDigite o ID do plano que deseja atualizar: "))
                
                # Encontra o plano selecionado
                selected_plan = None
                for plan in plans:
                    if plan['id'] == plan_id:
                        selected_plan = plan
                        break
                
                if not selected_plan:
                    print(f"Plano com ID {plan_id} não encontrado!")
                    continue
                
                print("\nDeixe em branco para manter o valor atual")
                
                name = input(f"Nome [{selected_plan['name']}]: ")
                description = input(f"Descrição [{selected_plan['description']}]: ")
                price = input(f"Preço [R$ {selected_plan['price']:.2f}]: ")
                message_limit = input(f"Limite de mensagens [{selected_plan['message_limit']}]: ")
                
                # Prepara os dados para atualização
                update_data = {}
                if name:
                    update_data['name'] = name
                if description:
                    update_data['description'] = description
                if price:
                    try:
                        update_data['price'] = float(price.replace(',', '.'))
                    except ValueError:
                        print("Preço inválido! Usando valor atual.")
                if message_limit:
                    try:
                        update_data['message_limit'] = int(message_limit)
                    except ValueError:
                        print("Limite inválido! Usando valor atual.")
                
                if update_data:
                    update_plan(plan_id, update_data)
                else:
                    print("Nenhuma alteração realizada!")
        
        elif option == "3":
            print("\nCriação de novo plano:")
            name = input("Nome: ")
            description = input("Descrição: ")
            type_options = ["free", "basic", "premium", "enterprise"]
            print("Tipos disponíveis:", ", ".join(type_options))
            plan_type = input("Tipo: ")
            
            while plan_type not in type_options:
                print(f"Tipo inválido! Escolha entre: {', '.join(type_options)}")
                plan_type = input("Tipo: ")
            
            price = input("Preço (R$): ")
            try:
                price = float(price.replace(',', '.'))
            except ValueError:
                print("Preço inválido! Usando 0.00")
                price = 0.0
            
            message_limit = input("Limite de mensagens: ")
            try:
                message_limit = int(message_limit)
            except ValueError:
                print("Limite inválido! Usando 10")
                message_limit = 10
            
            provider_options = ["zapi", "whatsapp_official", "evolution"]
            print("Provedores disponíveis:", ", ".join(provider_options))
            providers_input = input("Provedores permitidos (separados por vírgula): ")
            providers = [p.strip() for p in providers_input.split(',') if p.strip() in provider_options]
            
            if not providers:
                print("Nenhum provedor válido! Usando 'zapi'")
                providers = ["zapi"]
            
            # Prepara os dados para criação
            plan_data = {
                "name": name,
                "description": description,
                "type": plan_type,
                "price": price,
                "message_limit": message_limit,
                "allowed_providers": providers,
                "is_active": True
            }
            
            create_plan(plan_data)
        
        elif option == "4":
            plans = list_plans()
            if plans:
                plan_id = int(input("\nDigite o ID do plano que deseja ativar/desativar: "))
                
                # Encontra o plano selecionado
                selected_plan = None
                for plan in plans:
                    if plan['id'] == plan_id:
                        selected_plan = plan
                        break
                
                if not selected_plan:
                    print(f"Plano com ID {plan_id} não encontrado!")
                    continue
                
                new_status = not selected_plan['is_active']
                status_text = "ativar" if new_status else "desativar"
                
                confirm = input(f"\nDeseja {status_text} o plano '{selected_plan['name']}'? (s/n): ")
                
                if confirm.lower() == 's':
                    update_plan(plan_id, {"is_active": new_status})
        
        elif option == "5":
            plans = list_plans()
            if plans:
                plan_id = int(input("\nDigite o ID do plano que deseja excluir: "))
                
                # Encontra o plano selecionado
                selected_plan = None
                for plan in plans:
                    if plan['id'] == plan_id:
                        selected_plan = plan
                        break
                
                if not selected_plan:
                    print(f"Plano com ID {plan_id} não encontrado!")
                    continue
                
                confirm = input(f"\nATENÇÃO: Deseja realmente excluir o plano '{selected_plan['name']}'? (s/n): ")
                
                if confirm.lower() == 's':
                    delete_plan(plan_id)
        
        elif option == "0":
            print("\nSaindo do gerenciamento de planos...")
            break
        
        else:
            print("\nOpção inválida! Tente novamente.")

if __name__ == "__main__":
    print("Conectando ao Supabase...")
    interactive_menu()
