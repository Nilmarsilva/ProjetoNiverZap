from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.contact import Contact, ContactCreate, ContactUpdate, ContactList
from app.services.contact_service import ContactService

router = APIRouter()

@router.post("", response_model=Contact)
async def create_contact(
    contact_in: ContactCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cria um novo contato
    """
    try:
        contact = await ContactService.create_contact(current_user.id, contact_in)
        return contact
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("", response_model=ContactList)
async def read_contacts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém a lista de contatos do usuário atual
    """
    contacts = await ContactService.get_contacts(current_user.id, skip=skip, limit=limit, search=search)
    return contacts

@router.get("/{contact_id}", response_model=Contact)
async def read_contact(
    contact_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém um contato específico
    """
    contact = await ContactService.get_contact(current_user.id, contact_id)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contato não encontrado",
        )
    return contact

@router.put("/{contact_id}", response_model=Contact)
async def update_contact(
    contact_id: str,
    contact_in: ContactUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Atualiza um contato
    """
    try:
        contact = await ContactService.update_contact(current_user.id, contact_id, contact_in)
        return contact
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.delete("/{contact_id}", response_model=dict)
async def delete_contact(
    contact_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Remove um contato
    """
    try:
        result = await ContactService.delete_contact(current_user.id, contact_id)
        return {"success": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
