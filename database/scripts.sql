--13-02-2026

CREATE TABLE tutorial_videos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    video_type VARCHAR(10) CHECK (video_type IN ('YOUTUBE','GDRIVE')) NOT NULL,
    video_url NVARCHAR(MAX) NOT NULL,
    is_active BIT DEFAULT 1,
    flag_deleted BIT NOT NULL DEFAULT 0,
    created_by INT NULL,
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL
);

ALTER TABLE dbo.tutorial_videos ADD order_by int NULL
ALTER TABLE dbo.tutorial_videos ADD CONSTRAINT DF_tutorial_videos_order_by DEFAULT 0 FOR order_by

ALTER TABLE tutorial_videos ADD thumbnail VARCHAR(255);