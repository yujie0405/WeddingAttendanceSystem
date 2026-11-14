using System.Xml.Linq;
using Microsoft.Extensions.Configuration.Memory;

namespace WeddingSystem.Configuration;

public static class WebConfigSettings
{
    // XML defaults have lower priority than appsettings, secrets, environment, and CLI.
    public static void AddWebConfigDefaults(this WebApplicationBuilder builder)
    {
        var values = new Dictionary<string, string?>();
        foreach (var name in new[] { "web.config", "web.Local.config" })
        {
            var path = Path.Combine(builder.Environment.ContentRootPath, name);
            if (!File.Exists(path)) continue;
            var root = XDocument.Load(path).Root
                ?? throw new InvalidOperationException($"Invalid configuration file: {name}");
            foreach (var item in root.Element("connectionStrings")?.Elements("add") ?? [])
                values["ConnectionStrings:" + Required(item, "name")] = Required(item, "connectionString");
            foreach (var item in root.Element("appSettings")?.Elements("add") ?? [])
                values[Required(item, "key")] = Required(item, "value");
        }
        builder.Configuration.Sources.Insert(0, new MemoryConfigurationSource { InitialData = values });
    }

    private static string Required(XElement element, string attribute) =>
        (string?)element.Attribute(attribute)
        ?? throw new InvalidOperationException($"Missing configuration attribute: {attribute}");
}
