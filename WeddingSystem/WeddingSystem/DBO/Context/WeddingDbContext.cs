using Microsoft.EntityFrameworkCore;
using WeddingSystem.Models.Entities;

namespace WeddingSystem.DBO.Context;

public sealed class WeddingDbContext(DbContextOptions<WeddingDbContext> options) : DbContext(options)
{
    public DbSet<GuestEntity> Guests => Set<GuestEntity>();
    public DbSet<GuestTagEntity> GuestTags => Set<GuestTagEntity>();
    public DbSet<AttendanceStatusEntity> AttendanceStatuses => Set<AttendanceStatusEntity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var status = b.Entity<AttendanceStatusEntity>();
        status.ToTable("AttendanceStatus", "public");
        status.HasKey(x => x.Id);
        status.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        status.Property(x => x.Status).HasMaxLength(50).IsRequired();
        status.Property(x => x.CreatedDate).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        var tag = b.Entity<GuestTagEntity>();
        tag.ToTable("Guest_Tag", "public");
        tag.HasKey(x => x.Id);
        tag.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        tag.Property(x => x.TagName).HasMaxLength(100).IsRequired();
        tag.Property(x => x.CreatedDate).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        var guest = b.Entity<GuestEntity>();
        guest.ToTable("Guest", "public");
        guest.HasKey(x => x.Id);
        guest.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        guest.Property(x => x.GuestName).HasMaxLength(150).IsRequired();
        guest.Property(x => x.AttendanceStatusId).HasColumnName("AttendanceStatus");
        guest.Property(x => x.TableNumber).HasColumnName("Table");
        guest.Property(x => x.Angpau).HasPrecision(12, 2);
        guest.Property(x => x.CreatedDate).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        guest.HasOne(x => x.Relation).WithMany().HasForeignKey(x => x.RelationId).OnDelete(DeleteBehavior.Restrict);
        guest.HasOne(x => x.Attendance).WithMany().HasForeignKey(x => x.AttendanceStatusId).OnDelete(DeleteBehavior.Restrict);
    }
}
