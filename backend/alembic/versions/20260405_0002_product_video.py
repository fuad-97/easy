"""add product video url"""

from alembic import op
import sqlalchemy as sa


revision = "20260405_0002"
down_revision = "20260405_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("video_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("products", "video_url")
