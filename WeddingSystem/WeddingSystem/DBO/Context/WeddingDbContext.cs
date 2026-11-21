using Microsoft.EntityFrameworkCore;
using WeddingSystem.Models.Entities;

namespace WeddingSystem.DBO.Context;

public sealed class WeddingDbContext(DbContextOptions<WeddingDbContext> options) : DbContext(options)
{
    public DbSet<GuestEntity> Guests => Set<GuestEntity>();
    public DbSet<GuestTagEntity> GuestTags => Set<GuestTagEntity>();
    public DbSet<AttendanceStatusEntity> AttendanceStatuses => Set<AttendanceStatusEntity>();

    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<SeatingTableEntity> SeatingTables => Set<SeatingTableEntity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var seating = b.Entity<SeatingTableEntity>();
        seating.ToTable("Table", "public");
        seating.HasKey(x => x.Id);
        seating.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        seating.HasAlternateKey(x => x.TableNumber);
        seating.Property(x => x.TableNumber).HasColumnName("TableNum").HasConversion<short>().ValueGeneratedNever();
        seating.Property(x => x.GuestTagId).HasColumnName("TableGustTagNum").HasConversion<short>();
        seating.HasOne<GuestTagEntity>().WithMany().HasForeignKey(x => x.GuestTagId).OnDelete(DeleteBehavior.Restrict);
        var user = b.Entity<UserEntity>();
        user.ToTable("User", "public");
        user.HasKey(x => x.Id);
        user.Property(x => x.Id).HasColumnName("AccountId").ValueGeneratedNever();
        user.Property(x => x.Password).HasColumnType("text");
        user.Property(x => x.Email).HasMaxLength(254).IsRequired();
        user.Property(x => x.Username).HasColumnName("UserName").HasMaxLength(100).IsRequired();
        user.Property(x => x.Type).HasColumnName("type");
        user.Property(x => x.CreatedDate).HasColumnName("createdDate").HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        var status = b.Entity<AttendanceStatusEntity>();
        status.ToTable("AttendanceStatus", "public");
        status.HasKey(x => x.Id);
        status.Property(x => x.Id).HasColumnName("id").HasConversion<long>().ValueGeneratedOnAdd();
        status.Property(x => x.Status).HasMaxLength(50).IsRequired();
        status.Property(x => x.CreatedDate).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        var tag = b.Entity<GuestTagEntity>();
        tag.ToTable("Guest_Tag", "public");
        tag.HasKey(x => x.Id);
        tag.Property(x => x.Id).HasColumnName("id").HasConversion<long>().ValueGeneratedOnAdd();
        tag.Property(x => x.TagName).HasMaxLength(100).IsRequired();
        tag.Property(x => x.CreatedDate).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        var guest = b.Entity<GuestEntity>();
        guest.ToTable("Guest", "public");
        guest.HasKey(x => x.Id);
        guest.Property(x => x.Id).HasColumnName("id").HasConversion<long>().ValueGeneratedOnAdd();
        guest.Property(x => x.GuestName).HasMaxLength(150).IsRequired();
        guest.Property(x => x.RelationId).HasConversion<short>();
        guest.Property(x => x.WeddingSide).HasColumnName("WeddingSide").HasConversion<short>();
        guest.Property(x => x.GuestNum).HasConversion<short>();
        guest.Property(x => x.AttendanceStatusId).HasColumnName("Attendance Status").HasConversion<short>().HasDefaultValue(1);
        guest.Property(x => x.TableNumber).HasColumnName("Table").HasConversion<short>();
        guest.HasOne<SeatingTableEntity>().WithMany().HasForeignKey(x => x.TableNumber).HasPrincipalKey(x => x.TableNumber).OnDelete(DeleteBehavior.Restrict);
        guest.Property(x => x.Angpau).HasColumnName("Angpau").HasPrecision(12, 2).HasDefaultValue(0m);
        guest.Property(x => x.CreatedDate).HasDefaultValueSql("now()").ValueGeneratedOnAdd();
        guest.HasOne(x => x.Relation).WithMany().HasForeignKey(x => x.RelationId).OnDelete(DeleteBehavior.Restrict);
        guest.HasOne(x => x.Attendance).WithMany().HasForeignKey(x => x.AttendanceStatusId).OnDelete(DeleteBehavior.Restrict);
    }
}
