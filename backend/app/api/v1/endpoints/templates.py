from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.template import Template, TemplateCreate, TemplateUpdate, TemplateList
from app.services.template_service import TemplateService

router = APIRouter()

@router.post("", response_model=Template)
async def create_template(
    template_in: TemplateCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cria um novo template
    """
    try:
        template = await TemplateService.create_template(current_user.id, template_in)
        return template
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("", response_model=TemplateList)
async def read_templates(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém a lista de templates do usuário atual
    """
    templates = await TemplateService.get_templates(current_user.id, skip=skip, limit=limit, search=search)
    return templates

@router.get("/{template_id}", response_model=Template)
async def read_template(
    template_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém um template específico
    """
    template = await TemplateService.get_template(current_user.id, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template não encontrado",
        )
    return template

@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: str,
    template_in: TemplateUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Atualiza um template
    """
    try:
        template = await TemplateService.update_template(current_user.id, template_id, template_in)
        return template
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.delete("/{template_id}", response_model=dict)
async def delete_template(
    template_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Remove um template
    """
    try:
        result = await TemplateService.delete_template(current_user.id, template_id)
        return {"success": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
