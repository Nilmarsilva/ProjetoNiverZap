from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.plan import Plan, PlanCreate, PlanUpdate, PlanList
from app.services.plan_service import PlanService

router = APIRouter()

@router.get("", response_model=PlanList)
async def read_plans(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém a lista de planos disponíveis
    """
    plans = await PlanService.get_plans(skip=skip, limit=limit)
    return plans

@router.get("/{plan_id}", response_model=Plan)
async def read_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém um plano específico
    """
    plan = await PlanService.get_plan(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado",
        )
    return plan
